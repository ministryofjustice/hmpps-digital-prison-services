import { CaseLoad } from '../data/interfaces/caseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Location } from '../data/interfaces/location'

export default class UserService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  getUserLocations(token: string): Promise<Location[]> {
    return this.prisonApiClientBuilder(token).getUserLocations()
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.prisonApiClientBuilder(token).setActiveCaseload(caseLoad)
  }
}
