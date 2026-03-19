import { CaseLoad } from '../data/interfaces/caseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'


export default class UserService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  async getUserLocations(prisonId: string, username: string, token: string): Promise<LocationViewmodel[]> {
    const locations = await this.locationsInsidePrisonApiClientBuilder(token).getTopLevelResidentialLocations(prisonId, username)
    return locations.map( location => {
      const hasSublocations = location.subLocations && location.subLocations.length >= 1
      return {
        text: location.localName || location.fullLocationPath,
        value: `${prisonId}-${location.fullLocationPath}${hasSublocations ? '-' : ''}`,
      }
    })
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.prisonApiClientBuilder(token).setActiveCaseload(caseLoad)
  }
}

export interface LocationViewmodel {
  text: string,
  value: string,
}
