import { CaseLoad } from '../data/interfaces/caseLoad'
import { SystemTokenRestClientBuilder, RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'
import PrisonHierarchyDto from '../data/interfaces/prisonHierarchyDto'
import { LocationViewModel } from './interfaces/LocationViewModel'

export default class UserService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: SystemTokenRestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  async getUserLocations(prisonId: string, username: string): Promise<LocationViewModel[]> {
    const locations = await this.locationsInsidePrisonApiClientBuilder().getTopLevelResidentialLocations(
      prisonId,
      username,
    )
    const flattened = flattenLocations(locations)
    const onlyActive = flattened.filter(location => location.status === 'ACTIVE')
    const withoutLevelZero = onlyActive.filter(location => `${prisonId}-` !== location.fullLocationPath)
    return locationsAsViewModels(withoutLevelZero, prisonId)
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.prisonApiClientBuilder(token).setActiveCaseload(caseLoad)
  }
}

function flattenLocations(locations: PrisonHierarchyDto[]): PrisonHierarchyDto[] {
  return locations.flatMap(location => {
    const { subLocations, ...rest } = location
    if (subLocations && subLocations.length >= 1) {
      rest.fullLocationPath += '-'
    }
    return [rest as PrisonHierarchyDto, ...(subLocations ? flattenLocations(subLocations) : [])]
  })
}

function locationsAsViewModels(flattenedLocations: PrisonHierarchyDto[], prisonId: string): LocationViewModel[] {
  return flattenedLocations.map(location => {
    return {
      text: location.localName || location.fullLocationPath,
      value: `${prisonId}-${location.fullLocationPath}`,
    } as LocationViewModel
  })
}
