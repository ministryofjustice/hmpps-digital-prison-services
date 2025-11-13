import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadataFromContent } from '../utils/generateListMetadata'
import { formatName, mapToQueryString, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import {
  HealthAndMedicationData,
  ReferenceDataCodeSimple,
  ReferenceDataCodeWithComment,
} from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import AuditService from '../services/auditService'
import { sortParamToDirection, nextSortQuery } from '../utils/sorting'
import { isWithinLast3Days } from '../utils/dateHelpers'

const printDateFormat = `cccc d MMMM yyyy 'at' HH:mm`

export default class DietaryRequirementsController {
  constructor(
    private readonly dietReportingService: DietReportingService,
    private readonly pdfReportingService: PdfRenderingService,
    private readonly auditService: AuditService,
  ) {}

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25 }
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.size) queryParams.size = +req.query.size
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const sorting = {
        nameAndNumber: {
          direction: sortParamToDirection(req.query.nameAndNumber as string),
          url: `/dietary-requirements?${nextSortQuery(req, 'nameAndNumber')}`,
        },
        location: {
          direction: sortParamToDirection(req.query.location as string),
          url: `/dietary-requirements?${nextSortQuery(req, 'location')}`,
        },
      }

      const { data, filters } = await this.loadAllData(req, prisonId, {
        ...queryParams,
        showAll: true,
      })

      const filteredResults = data.filter(_ => true)
      const start = queryParams.showAll ? 0 : queryParams.size * (queryParams.page - 1)
      const end = queryParams.showAll ? 99999 : queryParams.size * queryParams.page
      const content = filteredResults.slice(start, end).map(this.buildContent)

      const listMetadata = generateListMetadataFromContent(filteredResults, queryParams, 'result', [], '', true)

      await this.auditService.auditDietReportView({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      return res.render('pages/dietaryRequirements/index', {
        content,
        listMetadata,
        filters,
        sorting,
        printQuery: mapToQueryString({
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
        }),
      })
    }
  }

  public printAll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { showAll: true }
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string

      const resp = await this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams)
      const datetime = format(new Date(), printDateFormat)

      await this.auditService.auditDietReportPrint({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      return this.pdfReportingService.renderDietReport(res, {
        footer: { datetime },
        content: {
          content: resp.content.map(this.buildContent),
          datetime,
        },
      })
    }
  }

  loadAllData = async (req: Request, prisonId: string, queryParams: DietaryRequirementsQueryParams) => {
    const {
      data: cachedData,
      sorting: cachedSorting,
      filters: cachedFilters,
      prisonId: cachedPrisonId,
    } = req.session?.dietaryRequirements ?? {}
    const sorting = {
      nameAndNumber: queryParams?.nameAndNumber,
      location: queryParams?.location,
    }

    if (
      !cachedData ||
      cachedData.length === 0 ||
      !cachedFilters ||
      cachedPrisonId !== prisonId ||
      !(cachedSorting?.nameAndNumber === queryParams?.nameAndNumber && cachedSorting?.location === queryParams.location)
    ) {
      const params = {
        ...queryParams,
        showAll: true,
      }
      const { clientToken } = req.middleware
      const data =
        (await this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, params))?.content ?? []

      // Cache the new data
      const filters = this.calculateFilters(data)
      req.session.dietaryRequirements = {
        data,
        prisonId,
        sorting,
        filters,
      }
      return { data, filters }
    }

    return {
      data: cachedData,
      filters: cachedFilters,
    }
  }

  calculateFilters = (data: HealthAndMedicationData[]) => {
    return {
      foodAllergies: this.buildFilterCategory(data, 'foodAllergies'),
      location: this.buildLocationCategory(data),
      medicalDiet: this.buildFilterCategory(data, 'medicalDietaryRequirements'),
      personalisedDiet: this.buildFilterCategory(data, 'personalisedDietaryRequirements'),
      prisoners: [
        {
          id: 'NEW_ARRIVAL_72',
          label: 'Arrived in the last 3 days',
          count: data.filter(item => isWithinLast3Days(item.arrivalDate)).length,
        },
      ],
    }
  }

  getEntries = (content?: ReferenceDataCodeWithComment[]) => {
    if (!content) return []
    const entries = content
      .filter(i => !i.value.id.endsWith('_OTHER'))
      .map(i => i.value.description)
      .sort()
    const other = content
      .filter(i => i.value.id.endsWith('_OTHER'))
      .map(i => `Other: ${i.comment}`)
      .sort()
    return [...entries, ...other]
  }

  buildContent = (prisoner: HealthAndMedicationData) => {
    return {
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      prisonerNumber: prisoner.prisonerNumber,
      arrivalDate: prisoner.arrivalDate,
      location: prisoner.location,
      dietaryRequirements: {
        medical: this.getEntries(prisoner?.health?.dietAndAllergy?.medicalDietaryRequirements?.value),
        foodAllergies: this.getEntries(prisoner?.health?.dietAndAllergy?.foodAllergies?.value),
        personal: this.getEntries(prisoner?.health?.dietAndAllergy?.personalisedDietaryRequirements?.value),
        cateringInstructions: prisoner?.health?.dietAndAllergy?.cateringInstructions?.value,
      },
    }
  }

  buildFilterCategory = (
    data: HealthAndMedicationData[],
    key: 'foodAllergies' | 'medicalDietaryRequirements' | 'personalisedDietaryRequirements',
  ) => {
    return Object.values(
      data
        .flatMap(item => item.health.dietAndAllergy[key]?.value.map(inner => inner?.value))
        .reduce((acc: Record<string, { id: string; label: string; count: number }>, val: ReferenceDataCodeSimple) => {
          if (!acc[val.id]) {
            acc[val.id] = {
              id: val.id,
              label: this.getFilterLabel(val, key),
              count: 1,
            }
          } else {
            acc[val.id].count += 1
          }
          return acc
        }, {}),
    ).sort((a, b) => {
      // Alphabetical order, with "Other ..." options forced to last place
      if (a.label.startsWith('Other ')) {
        return 1
      }
      if (b.label.startsWith('Other ')) {
        return -1
      }
      return a.label.localeCompare(b.label)
    })
  }

  buildLocationCategory = (data: HealthAndMedicationData[]) => {
    return Object.values(
      data
        .map(item => item.location)
        .reduce((acc: Record<string, { id: string; label: string; count: number }>, val: string) => {
          if (!acc[val]) {
            acc[val] = {
              id: val,
              label: val,
              count: 1,
            }
          } else {
            acc[val].count += 1
          }
          return acc
        }, {}),
    ).sort((a, b) => {
      return a.label.localeCompare(b.label)
    })
  }

  getFilterLabel = (
    item: ReferenceDataCodeSimple,
    key: 'foodAllergies' | 'medicalDietaryRequirements' | 'personalisedDietaryRequirements',
  ) => {
    if (item.id.endsWith('_OTHER')) {
      switch (key) {
        case 'foodAllergies':
          return 'Other food allergy'
        case 'medicalDietaryRequirements':
          return 'Other medical diet'
        case 'personalisedDietaryRequirements':
          return 'Other personalised diet'
        default:
          return item.description
      }
    }

    return item.description
  }
}
