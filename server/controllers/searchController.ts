import { isValid, isFuture, isBefore, parse } from 'date-fns'
import { alertFlagLabels } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Request, Response, RequestHandler } from 'express'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { RestClientBuilder } from '../data'
import {
  generateListMetadata,
  GlobalSearchFilterParams,
  ListMetadata,
  PrisonerSearchQueryParams,
} from '../utils/generateListMetadata'
import { calculateAge, formatLocation, formatName, mapToQueryString } from '../utils/utils'
import { Location } from '../data/interfaces/location'
import config from '../config'
import { HmppsError } from '../data/interfaces/hmppsError'
import Prisoner from '../data/interfaces/prisoner'

interface GlobalSearchQueryString {
  page: number
  searchText: string
  location: GlobalSearchFilterParams['locationFilter']
  gender: GlobalSearchFilterParams['genderFilter']
  referrer: string
  dateOfBirth: {
    day: string
    month: string
    year: string
  }
}

interface GlobalSearchResult {
  prisonerNumber: string
  name: string
  workingName: string
  dateOfBirth: string
  currentFacialImageId: number
  latestLocation: string
  prisonerProfileUrl: string
  showProfileLink: boolean
  updateLicenceLink?: string
  showUpdateLicenceLink: boolean
}

export default class SearchController {
  constructor(private readonly prisonerSearchApiClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  backLinkWhitelist: { [key: string]: string } = { licences: config.serviceUrls.licences }

  public localSearch() {
    return {
      get: (): RequestHandler => async (req, res) => {
        const queryParams = this.parseQuery(req.query)
        const { view, alerts, sort, term, location } = queryParams
        const selectedAlerts = alerts && alerts.map(alert => alert.split(',')).flat()

        // Perform the search
        const { results, listMetadata } = await this.performLocationSearch(
          queryParams,
          res.locals.user.locations,
          res.locals.user.activeCaseLoadId,
          req.middleware.clientToken,
        )

        return res.render('pages/prisonerSearch/index', {
          prisonerProfileBaseUrl: config.serviceUrls.prisonerProfile,
          encodedOriginalUrl: encodeURIComponent(req.originalUrl),
          listMetadata,
          view,
          links: this.buildLinksForPage(queryParams),
          alertOptions: alertFlagLabels.map(({ alertCodes, label }) => ({
            value: alertCodes,
            text: label,
            checked: Boolean(selectedAlerts) && selectedAlerts.some((alert: string) => alertCodes.includes(alert)),
          })),
          results,
          formValues: {
            location,
            alerts: selectedAlerts,
            sort,
            term,
          },
        })
      },

      post: (): RequestHandler => (req, res) => {
        const queryParams = {
          ...req.query,
          sort: req.body.sort,
        }

        return res.redirect(`${req.baseUrl}?${mapToQueryString(queryParams)}`)
      },
    }
  }

  public globalSearch() {
    return {
      get: (): RequestHandler => (req, res) => {
        const { searchText, referrer } = this.parseGlobalSearchQuery(req.query)
        return res.render('pages/globalSearch/index', {
          backLink: this.backLinkWhitelist[referrer],
          referrer,
          formValues: { searchText },
        })
      },

      results: {
        get: (): RequestHandler => async (req, res) => {
          const {
            user: { userRoles },
          } = res.locals
          const { searchText, location, gender, dateOfBirth, referrer } = this.parseGlobalSearchQuery(req.query)
          const isLicencesUser = userRoles.includes('LICENCE_RO')

          const filters: GlobalSearchFilterParams = {
            locationFilter: location,
            genderFilter: gender,
            dobDay: dateOfBirth.day,
            dobMonth: dateOfBirth.month,
            dobYear: dateOfBirth.year,
          }
          const openFilters = Boolean(Object.values(filters).filter(value => value && value !== 'ALL').length)

          const { results, listMetadata, errors } = await this.performGlobalSearch(req, res, filters)

          return res.render('pages/globalSearch/results', {
            prisonerProfileBaseUrl: config.serviceUrls.prisonerProfile,
            encodedOriginalUrl: encodeURIComponent(req.originalUrl),
            formValues: {
              searchText,
              filters,
            },
            openFilters,
            errors,
            results,
            listMetadata,
            isLicencesUser,
            backLink: this.backLinkWhitelist[referrer],
            referrer,
          })
        },
      },
    }
  }

  private parseQuery(query: Request['query']): PrisonerSearchQueryParams {
    const { view, showAll = 'false', sort = 'lastName,firstName,asc', term, page = 1, size = 50, location } = query
    const alerts = query.alerts && (Array.isArray(query.alerts) ? query.alerts : [query.alerts])

    /*
     * Legacy parameters from the old prisoner search - handled here so that any links will continue to work
     * sortFieldsWithOrder - the old sort field
     * alerts[] - the old alerts query param, as this used to be parsed by the querystring library
     * viewAll - equivalent to "show all"
     * pageLimitOption - equivalent to "size"
     */
    const { sortFieldsWithOrder, keywords, viewAll, pageLimitOption } = query
    const legacyAlerts =
      query['alerts[]'] && (Array.isArray(query['alerts[]']) ? query['alerts[]'] : [query['alerts[]']])

    return {
      showAll: viewAll === 'true' || showAll === 'true',
      view: view as string,
      alerts: (legacyAlerts ?? alerts) as string[],
      sort: (sortFieldsWithOrder ? this.searchSortFromLegacyField(sortFieldsWithOrder as string) : sort) as string,
      term: (keywords ?? term) as string,
      page: page as number,
      size: (pageLimitOption ?? size) as number,
      location: location as string,
    }
  }

  private parseGlobalSearchQuery(query: Request['query']): GlobalSearchQueryString {
    return {
      page: query.page ? Number(query.page) : 1,
      searchText: (query.searchText ?? '') as string,
      location: query.locationFilter as GlobalSearchFilterParams['locationFilter'],
      gender: query.genderFilter as GlobalSearchFilterParams['genderFilter'],
      referrer: query.referrer as string,
      dateOfBirth: {
        day: query.dobDay as string,
        month: query.dobMonth as string,
        year: query.dobYear as string,
      },
    }
  }

  private async performGlobalSearch(
    req: Request,
    res: Response,
    filters: GlobalSearchFilterParams,
  ): Promise<{
    results: GlobalSearchResult[]
    listMetadata?: ListMetadata<GlobalSearchFilterParams>
    errors: HmppsError[]
  }> {
    const { clientToken } = req.middleware
    const {
      user: { activeCaseLoad, userRoles },
    } = res.locals
    const currentlyInPrison = ({ status }: Prisoner) => (status && status.startsWith('ACTIVE') ? 'Y' : 'N')
    const prisonerBooked = (prisoner: Prisoner) => prisoner.bookingId > 0
    const userCanViewInactive = userRoles.includes('INACTIVE_BOOKINGS')
    const isLicencesUser = userRoles.includes('LICENCE_RO')
    const isLicencesVaryUser = userRoles.includes('LICENCE_VARY')
    const { searchText, gender, dateOfBirth, location, page, referrer } = this.parseGlobalSearchQuery(req.query)
    const dateErrors = this.validateDate(dateOfBirth)

    // If these are invalid we can exit early
    if (dateErrors.length > 0 || !searchText) {
      return { results: [], errors: dateErrors }
    }

    // Replace commas and additional spaces with a single space
    const isPrisonerIdentifier = (str: string) => /\d/.test(str)
    const prisonerSearchClient = this.prisonerSearchApiClientBuilder(clientToken)
    const includedFields = [
      'firstName',
      'lastName',
      'prisonerNumber',
      'dateOfBirth',
      'locationDescription',
      'prisonId',
      'currentFacialImageId',
      'status',
      'bookingId',
    ]
    const globalSearchParams = {
      page,
      gender,
      dateOfBirth:
        dateOfBirth.day &&
        dateOfBirth.month &&
        dateOfBirth.year &&
        this.validateDate(dateOfBirth).length === 0 &&
        `${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}`,
      location,
    }

    const getResponse = (searchTerm: string) => {
      const text = searchTerm.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim()
      if (isPrisonerIdentifier(text)) {
        return prisonerSearchClient.globalSearch(
          {
            ...globalSearchParams,
            prisonerIdentifier: text,
          },
          includedFields,
        )
      }

      const [lastName, firstName] = text.split(' ')
      return prisonerSearchClient.globalSearch(
        {
          ...globalSearchParams,
          firstName,
          lastName,
        },
        includedFields,
      )
    }

    const resp = await getResponse(searchText)
    const results = resp.content.map(prisoner => ({
      prisonerNumber: prisoner.prisonerNumber,
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      workingName: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      dateOfBirth: prisoner.dateOfBirth,
      currentFacialImageId: prisoner.currentFacialImageId,
      latestLocation: prisoner.locationDescription,
      prisonerProfileUrl: `${config.serviceUrls.prisonerProfile}/prisoner/${prisoner.prisonerNumber}`,
      showProfileLink:
        (activeCaseLoad &&
          ((userCanViewInactive && currentlyInPrison(prisoner) === 'N') || currentlyInPrison(prisoner) === 'Y') &&
          prisonerBooked(prisoner)) === true,
      updateLicenceLink: prisonerBooked(prisoner)
        ? `${config.serviceUrls.licences}/hdc/taskList/${prisoner.bookingId}`
        : undefined,
      showUpdateLicenceLink:
        isLicencesUser && (currentlyInPrison(prisoner) === 'Y' || isLicencesVaryUser) && prisonerBooked(prisoner),
    }))

    const listMetadata = generateListMetadata<GlobalSearchFilterParams>(
      resp,
      { page: undefined, searchText, referrer, ...filters },
      'result',
      [],
      '',
      false,
    )

    return { results, listMetadata, errors: [] }
  }

  /*
   * Handles the legacy "sortFieldsWithOrder" query parameter
   */
  private searchSortFromLegacyField(sortFieldsWithOrder: string): string {
    const [sortField, sortOrder] = sortFieldsWithOrder.split(':')
    if (sortField === 'assignedLivingUnitDesc') return `cellLocation,${sortOrder}`
    return `${sortField},${sortOrder.toLowerCase()}`
  }

  private buildLinksForPage(query: PrisonerSearchQueryParams) {
    return {
      gridView: `/prisoner-search?${mapToQueryString({ ...query, view: 'grid' })}`,
      listView: `/prisoner-search?${mapToQueryString({ ...query, view: 'list' })}`,
      allResults: `/prisoner-search?${mapToQueryString({ ...query, showAll: true })}`,
    }
  }

  private getInternalLocation(location: string, locations: Location[]): { internalLocation: string } {
    // this might be an internal location so prisonId is always first 3 characters
    const prisonId = location.slice(0, 3)

    const mapInternalLocation = (locationPrefix: string, subLocations: boolean) => {
      if (prisonId !== locationPrefix) {
        return subLocations ? `${locationPrefix}-` : locationPrefix
      }
      return undefined
    }

    const internalLocationMap = new Map(
      locations.map(obj => [obj.locationPrefix, mapInternalLocation(obj.locationPrefix, obj.subLocations)]),
    )

    return { internalLocation: internalLocationMap.get(location) }
  }

  private async performLocationSearch(
    queryParams: PrisonerSearchQueryParams,
    locations: Location[],
    activeCaseLoadId: string,
    clientToken: string,
  ) {
    const { alerts, sort, term, size, page, showAll, location } = queryParams
    const selectedAlerts = alerts && alerts.map(alert => alert.split(',')).flat()
    const prisonerSearchClient = this.prisonerSearchApiClientBuilder(clientToken)
    const resp = await prisonerSearchClient.locationSearch(activeCaseLoadId, {
      // This ensures areas with sublocations are handled correctly
      location: location && this.getInternalLocation(location, locations).internalLocation,
      size,
      page,
      term,
      alerts: selectedAlerts,
      sort,
      showAll,
    })

    // Delete page as it comes from the API
    const paramsForMetadata: PrisonerSearchQueryParams = { ...queryParams, page: undefined }

    const results =
      resp.content &&
      resp.content.map(prisoner => ({
        ...prisoner,
        iepLevel: prisoner.currentIncentive?.level.description ?? 'Not entered',
        assignedLivingUnitDesc: formatLocation(prisoner.cellLocation),
        name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
        alerts: alertFlagLabels.filter(alertFlag =>
          alertFlag.alertCodes.some(alert => {
            const alertsDetails = prisoner.alerts.map((a: { alertCode: string }) => a.alertCode)
            return alertsDetails && alertsDetails.includes(alert)
          }),
        ),
        age: calculateAge(prisoner.dateOfBirth).years,
      }))

    const listMetadata = generateListMetadata(resp, paramsForMetadata, 'result', [], '', true)
    // TODO: use the sorting from the metadata, not done for now as its a design change
    // const listMetadata = generateListMetadata(
    //   resp,
    //   queryParams,
    //   'result',
    //   [
    //     { value: 'lastName,firstName,asc', description: 'Last name, First name - A to Z' },
    //     { value: 'lastName,firstName,desc', description: 'Last name, First name - Z to A' },
    //     { value: 'cellLocation,asc', description: 'Location - Numbers then A to Z' },
    //     { value: 'cellLocation,desc', description: 'Location - Z to A then numbers' },
    //     // TODO: Hide if grid
    //     { value: 'dateOfBirth,desc', description: 'Age - youngest to oldest' },
    //     { value: 'dateOfBirth,asc', description: 'Age - oldest to youngest' },
    //   ],
    //   `Order ${resp.metadata.totalElements} results by`,
    //   true,
    // )

    return { results, listMetadata }
  }

  private validateDate(dateOfBirth?: { day: string; month: string; year: string }): HmppsError[] {
    const { day, month, year } = dateOfBirth
    const isRealDate = (date: string): boolean => {
      const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})[-/,. ](\d{4})/

      if (!dateFormatPattern.test(date)) return false
      const separator = date.match(dateFormatPattern)[2]
      return isValid(parse(date, `dd${separator}MM${separator}yyyy`, new Date()))
    }

    const errors: HmppsError[] = []
    const date = day && month && year ? `${day}/${month}/${year}` : null

    const missingFields = [day, month, year].filter(it => !it).length

    if (missingFields === 3) {
      return []
    }

    if (missingFields >= 1) {
      if (!day) errors.push({ text: 'Date of birth must include a day', href: '#dobDay' })
      else if (!month) errors.push({ text: 'Date of birth must include a month', href: '#dobMonth' })
      else if (!year) errors.push({ text: 'Date of birth must include a year', href: '#dobYear' })
      return errors
    }

    if (!isRealDate(date)) {
      errors.push(
        { text: 'Enter a date of birth which is a real date', href: '#dobDay' },
        { text: '', href: '#dobError' },
      )
    }

    if (isRealDate(date) && isFuture(date)) {
      errors.push({ text: `Date of birth must be in the past`, href: `#dobDay` }, { text: '', href: '#dobError' })
    }

    if (isRealDate(date) && isBefore(date, new Date(1900, 0, 1))) {
      errors.push({ text: `Date of birth must be after 1900`, href: `#dobDay` }, { text: '', href: '#dobError' })
    }

    return errors
  }
}
