import { RestClientBuilder } from '../data'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import { PrisonUser } from '../interfaces/prisonUser'
import { Location } from '../data/interfaces/location'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchApiClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  public async getResults(clientToken: string, user: PrisonUser, queryParams: PrisonerSearchQueryParams) {
    const { locations, activeCaseLoadId } = user
    const { location, size, page, term, alerts, sort, showAll } = queryParams

    const prisonerSearchClient = this.prisonerSearchApiClientBuilder(clientToken)
    return prisonerSearchClient.locationSearch(activeCaseLoadId, {
      // This ensures areas with sublocations are handled correctly
      location: location && this.getInternalLocation(location, locations).internalLocation,
      size,
      page,
      term,
      alerts,
      sort,
      showAll,
    })
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
}
