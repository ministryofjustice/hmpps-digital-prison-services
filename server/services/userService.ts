import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Location } from '../data/interfaces/location'

interface UserDetails {
  name: string
  displayName: string
  activeCaseLoadId?: string
  activeCaseLoad?: CaseLoad
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClientBuilder: RestClientBuilder<HmppsAuthClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClientBuilder(token).getUser()
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

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
