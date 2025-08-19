import { CaseLoad } from '../data/interfaces/caseLoad'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Location } from '../data/interfaces/location'

export default class UserService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClient.getUserCaseLoads(token)
  }

  getUserLocations(token: string): Promise<Location[]> {
    return this.prisonApiClient.getUserLocations(token)
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.prisonApiClient.setActiveCaseload(token, caseLoad)
  }
}
