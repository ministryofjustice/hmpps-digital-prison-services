import RestClient from './restClient'
import PrisonRollCount, { PrisonersInLocation, PrisonRollCountForCells } from './interfaces/prisonRollCount'
import { LocationsInsidePrisonApiClient } from './interfaces/locationsInsidePrisonApiClient'
import { InternalLocation } from './interfaces/internalLocation'

export interface ActiveAgencies {
  activeAgencies: string[]
}

export default class LocationsInsidePrisonApiRestClient implements LocationsInsidePrisonApiClient {
  constructor(private restClient: RestClient) {}

  private get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  async isActivePrison(prisonId: string): Promise<boolean> {
    const activeAgencies = await this.get<ActiveAgencies>({ path: `/info` })
    return activeAgencies.activeAgencies.includes(prisonId) || activeAgencies.activeAgencies.includes('***')
  }

  getLocation(locationId: string): Promise<InternalLocation> {
    return this.get<InternalLocation>({ path: `/locations/${locationId}` })
  }

  getPrisonRollCount(prisonId: string): Promise<PrisonRollCount> {
    return this.get<PrisonRollCount>({ path: `/prison/roll-count/${prisonId}` })
  }

  getPrisonRollCountForLocation(prisonId: string, locationId: string): Promise<PrisonRollCountForCells> {
    return this.get<PrisonRollCountForCells>({ path: `/prison/roll-count/${prisonId}/cells-only/${locationId}` })
  }

  getPrisonersAtLocation(locationId: string): Promise<PrisonersInLocation[]> {
    return this.get<PrisonersInLocation[]>({ path: `/prisoner-locations/id/${locationId}` })
  }

  getPrisonersInPrison(prisonId: string): Promise<PrisonersInLocation[]> {
    return this.get<PrisonersInLocation[]>({ path: `/prisoner-locations/prison/${prisonId}` })
  }
}
