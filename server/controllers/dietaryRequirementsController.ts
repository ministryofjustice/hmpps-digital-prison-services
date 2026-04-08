import { Request, RequestHandler, Response } from 'express'
import { format } from 'date-fns'
import { DietaryRequirementsQueryParams, generateListMetadata } from '../utils/generateListMetadata'
import { formatName, mapToQueryString, userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import {
  HealthAndMedicationData,
  HealthAndMedicationFilter,
  HealthAndMedicationFilters,
  ReferenceDataCodeWithComment,
} from '../data/interfaces/healthAndMedicationApiClient'
import DietReportingService from '../services/dietReportingService'
import PdfRenderingService from '../services/pdfRenderingService'
import AuditService from '../services/auditService'
import config from '../config'
import mergeFilterCounts from '../utils/facetedFilterUtils'

const DIETARY_FIELDS = ['personalisedDietaryRequirements', 'medicalDietaryRequirements', 'foodAllergies']
const LOCATION_FIELDS = ['topLocationLevel', 'recentArrival']

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

      const queryParams: DietaryRequirementsQueryParams = this.readSortingAndFiltersFromQueryParams(req)
      if (req.query.page) queryParams.page = +req.query.page
      if (req.query.showAll) queryParams.showAll = Boolean(req.query.showAll)

      const sortNameQuery = () => {
        let direction = 'ASC'

        if (req.query.nameAndNumber && req.query.nameAndNumber === 'ASC') {
          direction = 'DESC'
        }

        return mapToQueryString({
          personalDiet: queryParams.personalDiet,
          medicalDiet: queryParams.medicalDiet,
          foodAllergies: queryParams.foodAllergies,
          topLocationLevel: config.features.locationAndRecentArrivalFilters ? queryParams.topLocationLevel : null,
          recentArrival: config.features.locationAndRecentArrivalFilters && queryParams.recentArrival ? 'true' : null,
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
          topLocationLevel: config.features.locationAndRecentArrivalFilters ? queryParams.topLocationLevel : null,
          recentArrival: config.features.locationAndRecentArrivalFilters && queryParams.recentArrival ? 'true' : null,
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

      const dietaryConstraints = this.buildConstraints(queryParams, 'dietary')
      const locationConstraints = this.buildConstraints(queryParams, 'location')

      const [resp, fullFilterResponse, locationFilterResponse, dietaryFilterResponse] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
        this.dietReportingService.getDietaryFiltersForPrison(
          clientToken,
          prisonId,
          Object.keys(dietaryConstraints).length > 0 ? dietaryConstraints : undefined,
        ),
        this.dietReportingService.getDietaryFiltersForPrison(
          clientToken,
          prisonId,
          Object.keys(locationConstraints).length > 0 ? locationConstraints : undefined,
        ),
      ])

      const filters = this.mergeFacetedFilters(fullFilterResponse, locationFilterResponse, dietaryFilterResponse)

      delete queryParams.page

      const listMetadata = generateListMetadata(resp, queryParams, 'result', true)

      await this.auditService.auditDietReportView({
        username: res.locals.user.username,
        prisonId,
        requestId: req.id,
      })

      let recentArrivalFilters: HealthAndMedicationFilter[] = []
      if (config.features.locationAndRecentArrivalFilters) {
        if (Array.isArray(filters.recentArrival)) {
          recentArrivalFilters = filters.recentArrival
        } else if (filters.recentArrival) {
          recentArrivalFilters = [filters.recentArrival]
        }
      }
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
        topLocationLevel: config.features.locationAndRecentArrivalFilters
          ? filters.topLocationLevel.sort().map(filter => ({
              ...filter,
              checked: queryParams?.topLocationLevel?.includes(filter.value),
            }))
          : [],
        recentArrival: recentArrivalFilters.map(filter => ({
          ...filter,
          checked: queryParams?.recentArrival ? filter.value === 'ARRIVED_LAST_3_DAYS' : undefined,
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
          topLocationLevel: config.features.locationAndRecentArrivalFilters ? queryParams.topLocationLevel : null,
          recentArrival: config.features.locationAndRecentArrivalFilters && queryParams.recentArrival ? 'true' : null,
          nameAndNumber: req.query.nameAndNumber as string,
          location: req.query.location as string,
          showAll: req.query.showAll as string,
        }),
        hasAppliedFilters:
          queryParams.personalDiet ||
          queryParams.medicalDiet ||
          queryParams.foodAllergies ||
          (config.features.locationAndRecentArrivalFilters &&
            (queryParams.topLocationLevel || queryParams.recentArrival)),
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

      const queryString = mapToQueryString({
        personalDiet,
        medicalDiet,
        foodAllergies,
        topLocationLevel: config.features.locationAndRecentArrivalFilters ? topLocationLevel : null,
        recentArrival: config.features.locationAndRecentArrivalFilters && recentArrival ? 'true' : null,
        nameAndNumber: nameAndNumber as string,
        location: location as string,
        showAll: showAll && Boolean(showAll),
      })

      res.redirect(`/dietary-requirements?${queryString}`)
    }
  }

  public getFilterCounts(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { clientToken } = req.middleware
        const prisonId = res.locals.user.activeCaseLoadId

        const dietaryConstraints = this.collectQueryConstraints(req, DIETARY_FIELDS)
        const locationConstraints = this.collectQueryConstraints(req, LOCATION_FIELDS)

        const [fullFilterCounts, locationCounts, dietaryCounts] = await Promise.all([
          this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
          this.dietReportingService.getDietaryFiltersForPrison(
            clientToken,
            prisonId,
            Object.keys(dietaryConstraints).length > 0 ? dietaryConstraints : undefined,
          ),
          this.dietReportingService.getDietaryFiltersForPrison(
            clientToken,
            prisonId,
            Object.keys(locationConstraints).length > 0 ? locationConstraints : undefined,
          ),
        ])

        res.json(this.mergeFacetedFilters(fullFilterCounts, locationCounts, dietaryCounts))
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

      const queryParams: DietaryRequirementsQueryParams = this.readSortingAndFiltersFromQueryParams(req)
      queryParams.showAll = true

      const [resp, filters] = await Promise.all([
        this.dietReportingService.getDietaryRequirementsForPrison(clientToken, prisonId, queryParams),
        this.dietReportingService.getDietaryFiltersForPrison(clientToken, prisonId),
      ])
      const datetime = format(new Date(), `cccc d MMMM yyyy 'at' HH:mm`)

      const recentArrivalFilters: string[] = []
      const locationFilters: string[] = []
      if (config.features.locationAndRecentArrivalFilters) {
        if (queryParams.recentArrival) {
          const recentArrivalFilter = Array.isArray(filters.recentArrival)
            ? filters.recentArrival[0]
            : filters.recentArrival
          if (recentArrivalFilter) {
            recentArrivalFilters.push(recentArrivalFilter.name)
          }
        }
        locationFilters.push(
          ...(queryParams.topLocationLevel?.map(
            item => filters.topLocationLevel?.find(filter => filter.value === item)?.name,
          ) ?? []),
        )
      }

      const personalisedDietFilters: string[] = []
      personalisedDietFilters.push(
        ...(queryParams.personalDiet?.map(
          item => filters.personalisedDietaryRequirements.find(filter => filter.value === item)?.name,
        ) ?? []),
      )

      const medicalDietFilters: string[] = []
      medicalDietFilters.push(
        ...(queryParams.medicalDiet?.map(
          item => filters.medicalDietaryRequirements.find(filter => filter.value === item)?.name,
        ) ?? []),
      )

      const foodAllergiesFilters: string[] = []
      foodAllergiesFilters.push(
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
          recentArrivalFilters: recentArrivalFilters.filter(Boolean),
          locationFilters: locationFilters.filter(Boolean),
          personalisedDietFilters: personalisedDietFilters.filter(Boolean),
          medicalDietFilters: medicalDietFilters.filter(Boolean),
          foodAllergiesFilters: foodAllergiesFilters.filter(Boolean),
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
      arrivalDate: prisoner.lastAdmissionDate ? new Date(prisoner.lastAdmissionDate) : prisoner.arrivalDate,
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
    if (a.value === 'OTHER') return 1
    if (b.value === 'OTHER') return -1
    return a.name.localeCompare(b.name)
  }

  readSortingAndFiltersFromQueryParams(req: Request): DietaryRequirementsQueryParams {
    const queryParams: DietaryRequirementsQueryParams = { page: 1, size: 25 }
    if (req.query.nameAndNumber) queryParams.nameAndNumber = req.query.nameAndNumber as string
    if (req.query.location) queryParams.location = req.query.location as string
    if (req.query.personalDiet) queryParams.personalDiet = this.extractQueryParamsAsArray(req, 'personalDiet')
    if (req.query.medicalDiet) queryParams.medicalDiet = this.extractQueryParamsAsArray(req, 'medicalDiet')
    if (req.query.foodAllergies) queryParams.foodAllergies = this.extractQueryParamsAsArray(req, 'foodAllergies')
    if (config.features.locationAndRecentArrivalFilters) {
      if (req.query.topLocationLevel)
        queryParams.topLocationLevel = this.extractQueryParamsAsArray(req, 'topLocationLevel')
      if (req.query.recentArrival) queryParams.recentArrival = Boolean(req.query.recentArrival)
    }
    return queryParams
  }

  extractQueryParamsAsArray(req: Request, paramName: string): string[] {
    const param = req.query[paramName]
    if (Array.isArray(param)) return param.map(e => e as string)
    if (param) return [param as string]
    return []
  }

  private mergeFacetedFilters(
    full: HealthAndMedicationFilters,
    constrainedByDietary: HealthAndMedicationFilters,
    constrainedByLocation: HealthAndMedicationFilters,
  ): HealthAndMedicationFilters {
    return {
      personalisedDietaryRequirements: mergeFilterCounts(
        full?.personalisedDietaryRequirements ?? [],
        constrainedByLocation?.personalisedDietaryRequirements,
      ),
      medicalDietaryRequirements: mergeFilterCounts(
        full?.medicalDietaryRequirements ?? [],
        constrainedByLocation?.medicalDietaryRequirements,
      ),
      foodAllergies: mergeFilterCounts(full?.foodAllergies ?? [], constrainedByLocation?.foodAllergies),
      topLocationLevel: mergeFilterCounts(full?.topLocationLevel ?? [], constrainedByDietary?.topLocationLevel),
      recentArrival: mergeFilterCounts(full?.recentArrival ?? [], constrainedByDietary?.recentArrival),
    }
  }

  private buildConstraints(
    queryParams: DietaryRequirementsQueryParams,
    group: 'dietary' | 'location',
  ): Record<string, string[]> {
    const constraints: Record<string, string[]> = {}
    if (group === 'dietary') {
      if (queryParams.personalDiet) constraints.personalisedDietaryRequirements = queryParams.personalDiet
      if (queryParams.medicalDiet) constraints.medicalDietaryRequirements = queryParams.medicalDiet
      if (queryParams.foodAllergies) constraints.foodAllergies = queryParams.foodAllergies
    } else if (group === 'location' && config.features.locationAndRecentArrivalFilters) {
      if (queryParams.topLocationLevel) constraints.topLocationLevel = queryParams.topLocationLevel
      if (queryParams.recentArrival) constraints.recentArrival = ['ARRIVED_LAST_3_DAYS']
    }
    return constraints
  }

  private collectQueryConstraints(req: Request, fields: string[]): Record<string, string[]> {
    const constraints: Record<string, string[]> = {}
    for (const key of fields) {
      const param = req.query[key]
      if (param) {
        constraints[key] = Array.isArray(param) ? (param as string[]) : [param as string]
      }
    }
    if (fields.includes('topLocationLevel') && req.query.recentArrival) {
      constraints.recentArrival = ['ARRIVED_LAST_3_DAYS']
    }
    return constraints
  }
}
