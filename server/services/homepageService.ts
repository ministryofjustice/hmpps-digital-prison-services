import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { RestClientBuilder } from '../data'

export default class HomepageService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getTodaySection(clientToken: string, activeCaseLoadId: string) {
    const [assignedRollCount, unassignedRollCount, movements] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getRollCount(activeCaseLoadId),
      this.prisonApiClientBuilder(clientToken).getRollCount(activeCaseLoadId, true),
      this.prisonApiClientBuilder(clientToken).getMovements(activeCaseLoadId),
    ])

    const populationCount =
      assignedRollCount.reduce((total, block) => total + block.currentlyInCell, 0) +
      unassignedRollCount.reduce((total, block) => total + block.currentlyInCell, 0)

    return {
      unlockRollCount: populationCount - movements.in + movements.out,
      currentPopulationCount: populationCount,
      inTodayCount: movements.in,
      outTodayCount: movements.out,
      todayLastUpdated: new Date().toISOString(),
    }
  }
}
