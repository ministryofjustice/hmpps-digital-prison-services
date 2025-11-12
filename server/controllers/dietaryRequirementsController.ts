import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadataFromContent } from '../utils/generateListMetadata'
import { formatName, mapToQueryString, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import { HealthAndMedicationData, ReferenceDataCodeWithComment } from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import AuditService from '../services/auditService'
import { sortParamToDirection, nextSortQuery } from '../utils/sorting'

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

      const results = await this.loadAllData(req, prisonId, {
        ...queryParams,
        showAll: true,
      })

      const filteredResults = results.filter(_ => true)
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
      prisonId: cachedPrisonId,
    } = req.session?.dietaryRequirements ?? {}
    const sorting = {
      nameAndNumber: queryParams?.nameAndNumber,
      location: queryParams?.location,
    }

    if (
      !cachedData ||
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
      req.session.dietaryRequirements = {
        data,
        prisonId,
        sorting,
      }
      return data
    }

    return cachedData
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
}
