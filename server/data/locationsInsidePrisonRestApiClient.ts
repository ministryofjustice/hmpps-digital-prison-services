import { RestClient, asSystem, AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import { LocationsInsidePrisonApiClient } from './interfaces/locationsInsidePrisonApiClient'
import LocationsApiLocation from './interfaces/prisonHierarchyDto'
import config from '../config'
import logger, { warnLevelLogger } from '../../logger'

export default class LocationsInsidePrisonRestApiClient extends RestClient implements LocationsInsidePrisonApiClient {
  constructor(authenticationClient: AuthenticationClient) {
    super(
      'Locations Inside Prison API',
      config.apis.locationsInsidePrisonApi,
      config.production ? warnLevelLogger : logger,
      authenticationClient,
    )
  }

  getTopLevelResidentialLocations(prisonId: string, username: string): Promise<LocationsApiLocation[]> {
    return this.get<LocationsApiLocation[]>(
      { path: `/locations/prison/${prisonId}/residential-first-level` },
      asSystem(username),
    )
  }
}
