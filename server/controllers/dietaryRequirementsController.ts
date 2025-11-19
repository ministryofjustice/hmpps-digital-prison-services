import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadata } from '../utils/generateListMetadata'
import { formatName, mapToQueryString, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import {
  HealthAndMedicationData,
  HealthAndMedicationFilter,
  ReferenceDataCodeWithComment,
} from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import AuditService from '../services/auditService'

export default class DietaryRequirementsController {
  constructor(
    private readonly dietReportingService: DietReportingService,
    private readonly pdfReportingService: PdfRenderingService,
    private readonly auditService: AuditService,
  ) {}

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25 }
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string
      if (req.query.personalDiet) queryParams.personalDiet = this.extractQueryParamsAsArray(req, 'personalDiet')
      if (req.query.medicalDiet) queryParams.medicalDiet = this.extractQueryParamsAsArray(req, 'medicalDiet')
      if (req.query.foodAllergies) queryParams.foodAllergies = this.extractQueryParamsAsArray(req, 'foodAllergies')

      const sortNameQuery = () => {
        let direction = 'ASC'

        if (req.query.nameAndNumber && req.query.nameAndNumber === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({
          personalDiet: queryParams.personalDiet,
          medicalDiet: queryParams.medicalDiet,
          foodAllergies: queryParams.foodAllergies,
          nameAndNumber: direction,
          location: null,
          showAll: queryParams.showAll,
        })
      }

      const sortLocationQuery = () => {
        let direction = 'ASC'

        if (req.query.location && req.query.location === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({
          personalDiet: queryParams.personalDiet,
          medicalDiet: queryParams.medicalDiet,
          foodAllergies: queryParams.foodAllergies,
          location: direction,
          nameAndNumber: null,
          showAll: queryParams.showAll,
        })
      }

      const sortParamToDirection = (param: string) => {
        switch (param) {
          case 'ASC':
            return 'ascending'
          case 'DESC':
            return 'descending'
          default:
            return 'none'
        }
      }

      // TODO fix these (they won't maintain the filters)
      const sorting = {
        nameAndNumber: {
          direction: sortParamToDirection(req.query.nameAndNumber as string),
          url: `/dietary-requirements?${sortNameQuery()}`,
        },
        location: {
          direction: sortParamToDirection(req.query.location as string),
          url: `/dietary-requirements?${sortLocationQuery()}`,
        },
      }

      // Remove page as this comes from the API
      const [resp, filters] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
      ])
      delete queryParams.page

      const listMetadata = generateListMetadata(resp, queryParams, 'result', [], '', true)

      await this.auditService.auditDietReportView({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      // Mark selected filters and sort into alphabetical order, with "Other ..." options forced to last place
      const filterOptions = {
        foodAllergies: filters.foodAllergies.sort(this.alphabeticalOrderWithOtherInLastPlace).map(filter => ({
          ...filter,
          checked: queryParams?.foodAllergies?.includes(filter.value),
        })),
        personalisedDietaryRequirements: filters.personalisedDietaryRequirements
          .sort(this.alphabeticalOrderWithOtherInLastPlace)
          .map(filter => ({
            ...filter,
            checked: queryParams?.personalDiet?.includes(filter.value),
          })),
        medicalDietaryRequirements: filters.medicalDietaryRequirements
          .sort(this.alphabeticalOrderWithOtherInLastPlace)
          .map(filter => ({
            ...filter,
            checked: queryParams?.medicalDiet?.includes(filter.value),
          })),
      }

      return res.render('pages/dietaryRequirements/index', {
        content: resp.content.map(this.buildContent),
        listMetadata,
        sorting,
        filters: filterOptions,
        printQuery: mapToQueryString({
          personalDiet: queryParams.personalDiet,
          medicalDiet: queryParams.medicalDiet,
          foodAllergies: queryParams.foodAllergies,
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { foodAllergies, medicalDiet, personalDiet } = req.body
      const { nameAndNumber, location, showAll } = req.query

      const queryString = mapToQueryString({
        personalDiet,
        medicalDiet,
        foodAllergies,
        nameAndNumber: nameAndNumber as string,
        location: location as string,
        showAll: showAll && Boolean(showAll),
      })

      res.redirect(`/dietary-requirements?${queryString}`)
    }
  }

  public printAll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25, showAll: true }
      if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
      if (req.query.location) queryParams.location = req.query.location as string
      if (req.query.personalDiet) queryParams.personalDiet = this.extractQueryParamsAsArray(req, 'personalDiet')
      if (req.query.medicalDiet) queryParams.medicalDiet = this.extractQueryParamsAsArray(req, 'medicalDiet')
      if (req.query.foodAllergies) queryParams.foodAllergies = this.extractQueryParamsAsArray(req, 'foodAllergies')

      const [resp, filters] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
      ])
      const datetime = format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`)

      const activeFilters: string[] = []
      activeFilters.push(
        ...(queryParams.personalDiet?.map(
          item => filters.personalisedDietaryRequirements.find(filter => filter.value === item)?.name,
        ) ?? []),
      )
      activeFilters.push(
        ...(queryParams.medicalDiet?.map(
          item => filters.medicalDietaryRequirements.find(filter => filter.value === item)?.name,
        ) ?? []),
      )
      activeFilters.push(
        ...(queryParams.foodAllergies?.map(item => filters.foodAllergies.find(filter => filter.value === item)?.name) ??
          []),
      )

      await this.auditService.auditDietReportPrint({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      return this.pdfReportingService.renderDietReport(res, {
        footer: { datetime },
        content: {
          content: resp.content.map(this.buildContent),
          activeFilters: activeFilters.filter(Boolean),
          datetime,
        },
      })
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

  alphabeticalOrderWithOtherInLastPlace = (a: HealthAndMedicationFilter, b: HealthAndMedicationFilter) => {
    if (a.value === 'OTHER') {
      return 1
    }
    if (b.value === 'OTHER') {
      return -1
    }
    return a.name.localeCompare(b.name)
  }

  extractQueryParamsAsArray(req: Request, paramName: string): string[] {
    const param = req.query[paramName]
    const returnArray: string[] = []

    if (Array.isArray(param)) {
      for (const e of param) {
        returnArray.push(e as string)
      }
    } else if (param) {
      returnArray.push(param as string)
    }

    return returnArray
  }
}
