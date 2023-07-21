import RestClient from './restClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { BlockRollCount } from './interfaces/blockRollCount'
import { Movements } from './interfaces/movements'

export default class PrisonApiRestClient implements PrisonApiClient {
  constructor(private restClient: RestClient) {}

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
  }

  async getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' })
  }

  async getRollCount(prisonId: string, unassigned: boolean): Promise<BlockRollCount[]> {
    return this.get<BlockRollCount[]>({
      path: `/api/movements/rollcount/${prisonId}`,
      query: unassigned ? 'unassigned=true' : '',
    })
  }

  async getMovements(prisonId: string): Promise<Movements> {
    return this.get<Movements>({ path: `/api/movements/rollcount/${prisonId}/movements` })
  }
}
