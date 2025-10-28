import { alertFlagLabels } from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { Request, RequestHandler } from 'express'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { RestClientBuilder } from '../data'
import { generateListMetadata, PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import { calculateAge, formatLocation, formatName, mapToQueryString } from '../utils/utils'
import { Location } from '../data/interfaces/location'
import config from '../config'

export default class SearchController {
  constructor(private readonly prisonerSearchApiClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

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
}
