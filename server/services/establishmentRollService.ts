import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import EstablishmentRollCount from './interfaces/establishmentRollService/EstablishmentRollCount'
import EstablishmentRollSummary from './interfaces/establishmentRollService/EstablishmentRollSummary'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'

export default class EstablishmentRollService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
  ) {}

  public async getEstablishmentRollCounts(clientToken: string, caseLoadId: string): Promise<EstablishmentRollCount> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const locationsApi = this.locationsInsidePrisonApiClientBuilder(clientToken)

    const useLocationsApi = await locationsApi.isActivePrison(caseLoadId)

    const rollCount = useLocationsApi
      ? await locationsApi.getPrisonRollCount(caseLoadId)
      : await prisonApi.getPrisonRollCount(caseLoadId)

    return {
      todayStats: {
        unlockRoll: rollCount.numUnlockRollToday,
        inToday: rollCount.numArrivedToday,
        outToday: rollCount.numOutToday,
        currentRoll: rollCount.numCurrentPopulation,
        unassignedIn: rollCount.numInReception,
        enroute: rollCount.numStillToArrive,
        noCellAllocated: rollCount.numNoCellAllocated,
      },
      totals: rollCount.totals,
      wings: rollCount.locations,
    }
  }

  public async getLandingRollCounts(clientToken: string, caseLoadId: string, wingId: string, landingId: string) {
    const locationsApi = this.locationsInsidePrisonApiClientBuilder(clientToken)
    const prisonApi = this.prisonApiClientBuilder(clientToken)

    const useLocationsApi = await locationsApi.isActivePrison(caseLoadId)
    const rollCountForWing = useLocationsApi
      ? await locationsApi.getPrisonRollCountForLocation(caseLoadId, wingId)
      : await prisonApi.getPrisonRollCountForLocation(caseLoadId, wingId)

    const wing = rollCountForWing.locations[0]

    const landingOnWing = rollCountForWing.locations[0].subLocations.find(location => location.locationId === landingId)
    if (landingOnWing) {
      return {
        wingName: wing.localName || wing.locationCode,
        landingName: landingOnWing.localName || landingOnWing.locationCode,
        cellRollCounts: landingOnWing.subLocations,
        useWorkingCapacity: useLocationsApi,
      }
    }

    const spur = wing.subLocations.find(location =>
      location.subLocations.find(subLocation => subLocation.locationId === landingId),
    )

    const landing = spur?.subLocations.find(location => location.locationId === landingId)

    return {
      wingName: wing.localName || wing.locationCode,
      spurName: spur?.localName || spur?.locationCode,
      landingName: landing?.localName || landing?.locationCode,
      cellRollCounts: landing.subLocations,
      useWorkingCapacity: useLocationsApi,
    }
  }

  getEstablishmentRollSummary(clientToken: string, caseLoadId: string): Promise<EstablishmentRollSummary> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    return prisonApi.getPrisonRollCountSummary(caseLoadId)
  }
}
