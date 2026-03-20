import { CaseLoad } from '../data/interfaces/caseLoad'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'
import PrisonHierarchyDto from '../data/interfaces/prisonHierarchyDto'
import { LocationViewmodel } from './interfaces/LocationViewModel'

export default class UserService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.prisonApiClientBuilder(token).getUserCaseLoads()
  }

  async getUserLocations(prisonId: string, username: string, token: string): Promise<LocationViewmodel[]> {
    const locations = await this.locationsInsidePrisonApiClientBuilder(token).getTopLevelResidentialLocations(
      prisonId,
      username,
    )
    const flattened = flattenLocations(locations)
    const withoutTopLevel = flattened.filter(location => prisonId !== location.fullLocationPath)
    return locationsAsViewModels(withoutTopLevel, prisonId)
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.prisonApiClientBuilder(token).setActiveCaseload(caseLoad)
  }
}

function flattenLocations(locations: PrisonHierarchyDto[]): PrisonHierarchyDto[] {
  return locations.flatMap(location => {
    const { subLocations, ...rest } = location
    return [rest as PrisonHierarchyDto, ...(subLocations ? flattenLocations(subLocations) : [])]
  })
}

function locationsAsViewModels(flattenedLocations: PrisonHierarchyDto[], prisonId: string): LocationViewmodel[] {
  return flattenedLocations.map(location => {
    return {
      text: location.localName || location.fullLocationPath,
      value: `${prisonId}-${location.fullLocationPath}`,
    } as LocationViewmodel
  })
}
