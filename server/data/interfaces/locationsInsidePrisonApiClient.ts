import PrisonRollCount, { PrisonersInLocation, PrisonRollCountForCells } from './prisonRollCount'
import { InternalLocation } from './internalLocation'

export interface LocationsInsidePrisonApiClient {
  getLocation(locationId: string): Promise<InternalLocation>
  getPrisonRollCount(prisonId: string): Promise<PrisonRollCount>
  getPrisonRollCountForLocation(prisonId: string, locationId: string): Promise<PrisonRollCountForCells>
  getPrisonersAtLocation(locationId: string): Promise<PrisonersInLocation[]>
  getPrisonersInPrison(prisonId: string): Promise<PrisonersInLocation[]>
}
