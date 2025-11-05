import { alertFlagLabels } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Request, Response, RequestHandler } from 'express'
import {
  generateListMetadata,
  GlobalSearchFilterParams,
  ListMetadata,
  PrisonerSearchQueryParams,
} from '../utils/generateListMetadata'
import { calculateAge, formatLocation, formatName, mapToQueryString } from '../utils/utils'
import config from '../config'
import { HmppsError } from '../data/interfaces/hmppsError'
import Prisoner from '../data/interfaces/prisoner'
import GlobalSearchService from '../services/globalSearchService'
import { PrisonUser } from '../interfaces/prisonUser'
import PrisonerSearchService from '../services/prisonerSearchService'
import globalSearchDateValidator from '../utils/globalSearchDateValidator'
import { formatDate } from '../utils/dateHelpers'

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
  constructor(
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly globalSearchService: GlobalSearchService,
  ) {}

  backLinkWhitelist: { [key: string]: string } = { licences: config.serviceUrls.licences }

  public localSearch() {
    return {
      get: (): RequestHandler => async (req, res) => {
        const queryParams = this.parseQuery(req.query)
        const { view, alerts, sort, term, location } = queryParams
        const selectedAlerts = alerts && alerts.map(alert => alert.split(',')).flat()

        // Perform the search
        const { results, listMetadata } = await this.performLocationSearch(
          req.middleware.clientToken,
          res.locals.user,
          queryParams,
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
        const queryParams: PrisonerSearchQueryParams = {
          ...req.query,
          sort: req.body.sort,
        }

        // If this is present we should delete it as it's been overridden by the new sort
        delete queryParams.sortFieldsWithOrder

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
    const { user } = res.locals
    const { searchText, gender, dateOfBirth, location, page, referrer } = this.parseGlobalSearchQuery(req.query)
    const dateErrors = globalSearchDateValidator(dateOfBirth)

    // If these are invalid we can exit early
    if (dateErrors.length > 0 || !searchText) {
      return { results: [], errors: dateErrors }
    }

    const globalSearchParams = {
      searchTerm: searchText,
      page,
      gender,
      dateOfBirth:
        dateOfBirth.day && dateOfBirth.month && dateOfBirth.year
          ? `${dateOfBirth.year}-${dateOfBirth.month}-${dateOfBirth.day}`
          : undefined,
      location,
    }

    const resp = await this.globalSearchService.getResultsForUser(clientToken, globalSearchParams)
    const results = this.mapPrisonersToGlobalSearchResults(user, resp.content)
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

  private mapPrisonersToGlobalSearchResults(user: PrisonUser, prisoners: Prisoner[]): GlobalSearchResult[] {
    const { userRoles, activeCaseLoad } = user
    const currentlyInPrison = ({ status }: Prisoner) => (status && status.startsWith('ACTIVE') ? 'Y' : 'N')
    const prisonerBooked = (prisoner: Prisoner) => prisoner.bookingId > 0
    const userCanViewInactive = userRoles.includes('INACTIVE_BOOKINGS')
    const isLicencesUser = userRoles.includes('LICENCE_RO')
    const isLicencesVaryUser = userRoles.includes('LICENCE_VARY')

    return prisoners.map(prisoner => ({
      prisonerNumber: prisoner.prisonerNumber,
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      workingName: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      dateOfBirth: formatDate(prisoner.dateOfBirth, 'short'),
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
  }

  /*
   * Handles the legacy "sortFieldsWithOrder" query parameter
   */
  private searchSortFromLegacyField(sortFieldsWithOrder: string): string {
    const [sortField, sortOrder] = sortFieldsWithOrder.split(':')
    if (sortField === 'assignedLivingUnitDesc') return `cellLocation,${sortOrder.toLowerCase()}`
    return `${sortField},${sortOrder.toLowerCase()}`
  }

  private buildLinksForPage(query: PrisonerSearchQueryParams) {
    return {
      gridView: `/prisoner-search?${mapToQueryString({ ...query, view: 'grid' })}`,
      listView: `/prisoner-search?${mapToQueryString({ ...query, view: 'list' })}`,
      allResults: `/prisoner-search?${mapToQueryString({ ...query, showAll: true })}`,
    }
  }

  private async performLocationSearch(clientToken: string, user: PrisonUser, queryParams: PrisonerSearchQueryParams) {
    const resp = await this.prisonerSearchService.getResults(clientToken, user, queryParams)

    // Delete page as it comes from the API
    const paramsForMetadata: PrisonerSearchQueryParams = { ...queryParams, page: undefined }

    const results =
      resp.content &&
      resp.content.map(prisoner => ({
        prisonerNumber: prisoner.prisonerNumber,
        currentFacialImageId: prisoner.currentFacialImageId,
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

    // TODO: use the sorting from the metadata, not done for now as its a design change
    const listMetadata = generateListMetadata(resp, paramsForMetadata, 'result', [], '', true)

    return { results, listMetadata }
  }
}
