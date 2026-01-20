import { AlertFlagLabel, alertFlagLabels } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Request, Response, RequestHandler } from 'express'
import {
  generateListMetadata,
  GlobalSearchFilterParams,
  ListMetadata,
  PrisonerSearchQueryParams,
} from '../utils/generateListMetadata'
import {
  calculateAge,
  formatLocation,
  formatName,
  mapToQueryString,
  shouldLinkProfile,
  shouldShowProfileImage,
  shouldShowUpdateLicenceLink,
} from '../utils/utils'
import config from '../config'
import { HmppsError } from '../data/interfaces/hmppsError'
import Prisoner from '../data/interfaces/prisoner'
import GlobalSearchService from '../services/globalSearchService'
import { PrisonUser } from '../interfaces/prisonUser'
import PrisonerSearchService from '../services/prisonerSearchService'
import globalSearchDateValidator from '../utils/globalSearchDateValidator'
import { formatDate } from '../utils/dateHelpers'
import MetricsService from '../services/metricsService'
import AuditService from '../services/auditService'

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
  showProfileImage: boolean
}

interface PrisonerSearchResult {
  prisonerNumber: string
  currentFacialImageId: number
  iepLevel: string
  assignedLivingUnitDesc: string
  name: string
  alerts: AlertFlagLabel[]
  age: number
}

export default class SearchController {
  constructor(
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly globalSearchService: GlobalSearchService,
    private readonly metricsService: MetricsService,
    private readonly auditService: AuditService,
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

        this.metricsService.trackPrisonerSearchQuery({
          offenderNos: results.map(({ prisonerNumber }) => prisonerNumber),
          searchTerms: queryParams,
          user: res.locals.user,
        })

        this.auditService.auditPrisonerSearch({
          username: res.locals.user.username,
          requestId: req.id,
          searchDetails: {
            query: queryParams,
            results: {
              prisonerNumbers: results.map(({ prisonerNumber }) => prisonerNumber),
              prisonerInformationDisplayed:
                view === 'list'
                  ? ['number', 'image', 'profileLink', 'assignedLivingUnit', 'iepLevel', 'age', 'alertFlags']
                  : ['number', 'image', 'profileLink', 'assignedLivingUnit'],
            },
          },
        })

        const locationOptions = [
          { value: res.locals.user.activeCaseLoad.caseLoadId, text: res.locals.user.activeCaseLoad.description },
          ...res.locals.user.locations.map(option => ({ value: option.locationPrefix, text: option.description })),
        ]

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
          locationOptions,
          printedValues: {
            location: locationOptions.find(loc => loc.value === location),
            alerts: alertFlagLabels
              .filter(({ alertCodes }) => selectedAlerts?.find((alert: string) => alertCodes.includes(alert)))
              .map(({ label }) => label),
          },
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
          const globalSearchQuery = this.parseGlobalSearchQuery(req.query)
          const { searchText, location, gender, dateOfBirth, referrer } = globalSearchQuery
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

          this.metricsService.trackGlobalSearchQuery({
            offenderNos: results.map(({ prisonerNumber }) => prisonerNumber),
            user: res.locals.user,
            openFilterValues: filters,
            searchText,
          })

          this.auditService.auditGlobalSearch({
            username: res.locals.user.username,
            requestId: req.id,
            searchDetails: {
              query: globalSearchQuery,
              results: {
                prisonerNumbers: results.map(({ prisonerNumber }) => prisonerNumber),
                prisonerInformationDisplayed: ['name', 'workingName', 'prisonerNumber', 'dateOfBirth', 'location'],
                licenceLinkedPrisonerNumbers: results
                  .filter(({ showUpdateLicenceLink }) => showUpdateLicenceLink)
                  .map(({ prisonerNumber }) => prisonerNumber),
                profileLinkedPrisonerNumbers: results
                  .filter(({ showProfileLink }) => showProfileLink)
                  .map(({ prisonerNumber }) => prisonerNumber),
                profilePictureDisplayedPrisonerNumbers: results
                  .filter(({ showProfileImage }) => showProfileImage)
                  .map(({ prisonerNumber }) => prisonerNumber),
              },
            },
          })

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
    const prisonerBooked = (prisoner: Prisoner) => prisoner.bookingId > 0

    return prisoners.map(prisoner => ({
      prisonerNumber: prisoner.prisonerNumber,
      name: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      workingName: formatName(prisoner.firstName, '', prisoner.lastName, { style: 'lastCommaFirst' }),
      dateOfBirth: formatDate(prisoner.dateOfBirth, 'short'),
      currentFacialImageId: prisoner.currentFacialImageId,
      latestLocation: prisoner.locationDescription,
      prisonerProfileUrl: `${config.serviceUrls.prisonerProfile}/prisoner/${prisoner.prisonerNumber}`,
      updateLicenceLink: prisonerBooked(prisoner)
        ? `${config.serviceUrls.licences}/hdc/taskList/${prisoner.bookingId}`
        : undefined,
      showUpdateLicenceLink: shouldShowUpdateLicenceLink(user, prisoner),
      showProfileLink: shouldLinkProfile(user, prisoner),
      showProfileImage: shouldShowProfileImage(user, prisoner),
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
    }
  }

  private async performLocationSearch(
    clientToken: string,
    user: PrisonUser,
    queryParams: PrisonerSearchQueryParams,
  ): Promise<{
    results: PrisonerSearchResult[]
    listMetadata: ListMetadata<PrisonerSearchQueryParams>
  }> {
    // BEGIN - Ported behaviour from the old search
    // when the prison-api was used, searching for prisoners not in your caseload returned no results
    // rightly or wrongly this replicates that behaviour (maybe a 403 error could have been better)
    const prisonId = queryParams.location?.slice(0, 3)
    const caseloadIds = user.caseLoads.map(caseload => caseload.caseLoadId)
    if (prisonId && !caseloadIds.includes(prisonId)) return { results: [], listMetadata: null }
    // END

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
