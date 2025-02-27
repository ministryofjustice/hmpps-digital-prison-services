import RestClient from './restClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import PrisonRollCount from './interfaces/prisonRollCount'
import EstablishmentRollSummary from '../services/interfaces/establishmentRollService/EstablishmentRollSummary'

export default class PrisonApiRestClient implements PrisonApiClient {
  constructor(private restClient: RestClient) {}

  private get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private put<T>(args: object): Promise<T> {
    return this.restClient.put<T>(args)
  }

  private async post<T>(args: object): Promise<T> {
    return this.restClient.post<T>(args)
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
  }

  getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' })
  }

  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.put<Record<string, string>>({ path: '/api/users/me/activeCaseLoad', data: caseLoad })
  }

  getPrisonRollCountSummary(prisonId: string): Promise<EstablishmentRollSummary> {
    return this.get<PrisonRollCount>({ path: `/api/prison/roll-count/${prisonId}/summary` })
  }
}
