import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadata } from '../utils/generateListMetadata'
import { formatName, mapToQueryString, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import {
  HealthAndMedicationData,
  HealthAndMedicationFilters,
  ReferenceDataCodeWithComment,
} from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import AuditService from '../services/auditService'
import config from '../config'

export default class DietaryRequirementsController {
  constructor(
    private readonly dietReportingService: DietReportingService,
    private readonly pdfReportingService: PdfRenderingService,
    private readonly auditService: AuditService,
  ) {}

  public get(): RequestHandler {
    const toCheckbox = <T extends { value: string; name: string }>(
      filters: T[],
      appliedValues?: string[],
    ): (T & { checked: boolean })[] =>
      (filters || [])
        .sort((a, b) => {
          if (a.value === 'OTHER') return 1
          if (b.value === 'OTHER') return -1
          return a.name.localeCompare(b.name)
        })
        .map(filter => ({ ...filter, checked: appliedValues?.includes(filter.value) }))

    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams = parseQueryParams(req)

      const getSortQuery = (param: 'nameAndNumber' | 'location') =>
        buildQueryString(queryParams, {
          [param]: req.query[param] === 'ASC' ? 'DESC' : 'ASC',
          [param === 'nameAndNumber' ? 'location' : 'nameAndNumber']: null,
        })

      const getSortDirection = (param: string): 'ascending' | 'descending' | 'none' => {
        if (param === 'ASC') return 'ascending'
        if (param === 'DESC') return 'descending'
        return 'none'
      }

      const sorting = {
        nameAndNumber: {
          direction: getSortDirection(req.query.nameAndNumber as string),
          url: `/dietary-requirements?${getSortQuery('nameAndNumber')}`,
        },
        location: {
          direction: getSortDirection(req.query.location as string),
          url: `/dietary-requirements?${getSortQuery('location')}`,
        },
      }

      const [resp, filters] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        fetchFacetedFilters(queryParams, f =>
          f
            ? this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId, f)
            : this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
        ),
      ])

      delete queryParams.page

      const listMetadata = generateListMetadata(resp, queryParams, 'result', true)

      await this.auditService.auditDietReportView({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      const isNewFiltersEnabled = config.features.locationAndRecentArrivalFilters
      const filterOptions = {
        foodAllergies: toCheckbox(filters.foodAllergies, queryParams.foodAllergies),
        personalisedDietaryRequirements: toCheckbox(filters.personalisedDietaryRequirements, queryParams.personalDiet),
        medicalDietaryRequirements: toCheckbox(filters.medicalDietaryRequirements, queryParams.medicalDiet),
        topLocationLevel: isNewFiltersEnabled ? toCheckbox(filters.topLocationLevel, queryParams.topLocationLevel) : [],
        recentArrival: (isNewFiltersEnabled ? (filters.recentArrival ?? []) : []).map(f => ({
          ...f,
          checked: queryParams?.recentArrival ? f.value === 'ARRIVED_LAST_3_DAYS' : undefined,
        })),
      }

      return res.render('pages/dietaryRequirements/index', {
        content: resp.content.map(this.formatPrisoner),
        listMetadata,
        sorting,
        filters: filterOptions,
        printQuery: buildQueryString(queryParams, {
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
        hasAppliedFilters:
          queryParams.personalDiet ||
          queryParams.medicalDiet ||
          queryParams.foodAllergies ||
          (isNewFiltersEnabled && (queryParams.topLocationLevel || queryParams.recentArrival)),
        clearAllQuery: mapToQueryString({
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { foodAllergies, medicalDiet, personalDiet, topLocationLevel, recentArrival } = req.body
      const { nameAndNumber, location, showAll } = req.query

      const queryParams: DietaryRequirementsQueryParams = {
        personalDiet,
        medicalDiet,
        foodAllergies,
        topLocationLevel,
        recentArrival: !!recentArrival,
        nameAndNumber: nameAndNumber as string,
        location: location as string,
        showAll: showAll && Boolean(showAll),
      }

      res.redirect(`/dietary-requirements?${buildQueryString(queryParams)}`)
    }
  }

  public getFilterCounts(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { clientToken } = req.middleware
        const prisonId = res.locals.user.activeCaseLoadId

        const queryParams = parseQueryParams(req)
        res.json(
          await fetchFacetedFilters(queryParams, f =>
            f
              ? this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId, f)
              : this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
          ),
        )
      } catch (error) {
        const status = error?.status ?? 500
        res.status(status).json({ status, error: error.message })
      }
    }
  }

  public printAll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const prisonId = res.locals.user.activeCaseLoadId

      if (!userHasRoles([Role.DietAndAllergiesReport], res.locals.user.userRoles)) {
        return res.render('notFound', { url: '/' })
      }

      const queryParams: DietaryRequirementsQueryParams = parseQueryParams(req)
      queryParams.showAll = true

      const [resp, filters] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
      ])
      const datetime = format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`)

      const isNewFiltersEnabled = config.features.locationAndRecentArrivalFilters
      const getAppliedFilters = (applied: string[], available: { value: string; name: string }[]) =>
        applied?.map(value => available?.find(f => f.value === value)?.name).filter(Boolean) ?? []

      await this.auditService.auditDietReportPrint({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      return this.pdfReportingService.renderDietReport(res, {
        footer: { datetime },
        content: {
          content: resp.content.map(this.formatPrisoner),
          recentArrivalFilters:
            isNewFiltersEnabled && queryParams.recentArrival
              ? [filters.recentArrival?.find(f => f.value === 'ARRIVED_LAST_3_DAYS')?.name].filter(Boolean)
              : [],
          locationFilters: isNewFiltersEnabled
            ? getAppliedFilters(queryParams.topLocationLevel, filters.topLocationLevel)
            : [],
          personalisedDietFilters: getAppliedFilters(queryParams.personalDiet, filters.personalisedDietaryRequirements),
          medicalDietFilters: getAppliedFilters(queryParams.medicalDiet, filters.medicalDietaryRequirements),
          foodAllergiesFilters: getAppliedFilters(queryParams.foodAllergies, filters.foodAllergies),
          datetime,
        },
      })
    }
  }

  formatPrisoner = (prisoner: HealthAndMedicationData) => {
    const formatDietaryRequirements = (content?: ReferenceDataCodeWithComment[]): string[] => {
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
    return {
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      prisonerNumber: prisoner.prisonerNumber,
      arrivalDate: prisoner.lastAdmissionDate ? new Date(prisoner.lastAdmissionDate) : prisoner.arrivalDate,
      location: prisoner.location,
      dietaryRequirements: {
        medical: formatDietaryRequirements(prisoner?.health?.dietAndAllergy?.medicalDietaryRequirements?.value),
        foodAllergies: formatDietaryRequirements(prisoner?.health?.dietAndAllergy?.foodAllergies?.value),
        personal: formatDietaryRequirements(prisoner?.health?.dietAndAllergy?.personalisedDietaryRequirements?.value),
        cateringInstructions: prisoner?.health?.dietAndAllergy?.cateringInstructions?.value,
      },
    }
  }
}

function buildQueryString(
  queryParams: DietaryRequirementsQueryParams,
  overrides: Record<string, string | string[] | boolean | number> = {},
) {
  const { locationAndRecentArrivalFilters: isNewFiltersEnabled } = config.features
  return mapToQueryString({
    personalDiet: queryParams.personalDiet,
    medicalDiet: queryParams.medicalDiet,
    foodAllergies: queryParams.foodAllergies,
    topLocationLevel: isNewFiltersEnabled ? queryParams.topLocationLevel : null,
    recentArrival: isNewFiltersEnabled && queryParams.recentArrival ? 'true' : null,
    nameAndNumber: queryParams.nameAndNumber,
    location: queryParams.location,
    showAll: queryParams.showAll,
    ...overrides,
  })
}

function parseQueryParams(req: Request): DietaryRequirementsQueryParams {
  const { nameAndNumber, location, page, showAll } = req.query
  const isNewFiltersEnabled = config.features.locationAndRecentArrivalFilters
  const getArray = (paramName: string): string[] => {
    const param = req.query[paramName]
    if (Array.isArray(param)) return param as string[]
    return param ? [param as string] : []
  }
  return {
    page: page ? +page : 1,
    size: 25,
    ...(nameAndNumber && { nameAndNumber: nameAndNumber as string }),
    ...(location && { location: location as string }),
    ...(req.query.personalDiet && { personalDiet: getArray('personalDiet') }),
    ...(req.query.medicalDiet && { medicalDiet: getArray('medicalDiet') }),
    ...(req.query.foodAllergies && { foodAllergies: getArray('foodAllergies') }),
    ...(isNewFiltersEnabled && {
      ...(req.query.topLocationLevel && { topLocationLevel: getArray('topLocationLevel') }),
      ...(req.query.recentArrival && { recentArrival: Boolean(req.query.recentArrival) }),
    }),
    ...(showAll && { showAll: Boolean(showAll) }),
  }
}

async function fetchFacetedFilters(
  queryParams: DietaryRequirementsQueryParams,
  fetcher: (constraints?: Record<string, string[]>) => Promise<HealthAndMedicationFilters>,
): Promise<HealthAndMedicationFilters> {
  const isNewFiltersEnabled = config.features.locationAndRecentArrivalFilters
  const dietary = {
    ...(queryParams.personalDiet && { personalisedDietaryRequirements: queryParams.personalDiet }),
    ...(queryParams.medicalDiet && { medicalDietaryRequirements: queryParams.medicalDiet }),
    ...(queryParams.foodAllergies && { foodAllergies: queryParams.foodAllergies }),
  }
  const location =
    isNewFiltersEnabled && queryParams.topLocationLevel ? { topLocationLevel: queryParams.topLocationLevel } : {}
  const recentArrival = isNewFiltersEnabled && queryParams.recentArrival ? { recentArrival: ['true'] } : {}

  const [full, forDietary, forLocation, forRecentArrival] = await Promise.all([
    fetcher(),
    fetcher({ ...location, ...recentArrival }),
    fetcher({ ...dietary, ...recentArrival }),
    fetcher({ ...dietary, ...location }),
  ])

  const merge = (key: keyof HealthAndMedicationFilters, constrained: HealthAndMedicationFilters) => {
    const map = new Map((constrained?.[key] || []).map(f => [f.value, f.count]))
    return (full?.[key] || []).map(f => ({ ...f, count: map.get(f.value) ?? 0 }))
  }

  return {
    personalisedDietaryRequirements: merge('personalisedDietaryRequirements', forDietary),
    medicalDietaryRequirements: merge('medicalDietaryRequirements', forDietary),
    foodAllergies: merge('foodAllergies', forDietary),
    topLocationLevel: merge('topLocationLevel', forLocation),
    recentArrival: merge('recentArrival', forRecentArrival),
  }
}
