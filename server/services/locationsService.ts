import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Location } from '../data/interfaces/location'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'
import { InternalLocation } from '../data/interfaces/internalLocation'

export default class LocationService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  public async isActivePrison(clientToken: string, prisonId: string): Promise<boolean> {
    const locationsApi = this.locationsInsidePrisonApiClientBuilder(clientToken)

    return locationsApi.isActivePrison(prisonId)
  }

  public async getLocationInfo(clientToken: string, locationId: string): Promise<Location> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)

    return prisonApi.getLocation(locationId)
  }

  public async getInternalLocationInfo(clientToken: string, locationId: string): Promise<InternalLocation> {
    const locationsApi = this.locationsInsidePrisonApiClientBuilder(clientToken)

    return locationsApi.getLocation(locationId)
  }
}
