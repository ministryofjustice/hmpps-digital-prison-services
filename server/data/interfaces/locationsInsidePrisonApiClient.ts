import PrisonRollCount, { PrisonersInLocation } from './prisonRollCount'
import { InternalLocation } from './internalLocation'

export interface LocationsInsidePrisonApiClient {
  getLocation(locationId: string): Promise<InternalLocation>
  getPrisonRollCount(prisonId: string): Promise<PrisonRollCount>
  getPrisonRollCountForLocation(prisonId: string, locationId: string): Promise<PrisonRollCount>
  getPrisonersAtLocation(locationId: string): Promise<PrisonersInLocation[]>
  getPrisonersInPrison(prisonId: string): Promise<PrisonersInLocation[]>
}
