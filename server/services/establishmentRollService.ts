import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import EstablishmentRollCount from './interfaces/establishmentRollService/EstablishmentRollCount'

export default class EstablishmentRollService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getEstablishmentRollCounts(clientToken: string, caseLoadId: string): Promise<EstablishmentRollCount> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const rollCount = await prisonApi.getPrisonRollCount(caseLoadId)

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

  public async getLandingRollCounts(clientToken: string, caseLoadId: string, landingId: number) {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    return prisonApi.getRollCount(caseLoadId, {
      wingOnly: false,
      showCells: true,
      parentLocationId: landingId,
    })
  }
}
