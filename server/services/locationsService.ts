import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Location } from '../data/interfaces/location'

export default class LocationService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getLocationInfo(clientToken: string, locationId: string): Promise<Location> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)

    return prisonApi.getLocation(locationId)
  }
}
