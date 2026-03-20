import LocationsApiLocation from './prisonHierarchyDto'

export interface LocationsInsidePrisonApiClient {
  getTopLevelResidentialLocations(prisonId: string, username: string): Promise<LocationsApiLocation[]>
}
