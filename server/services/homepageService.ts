import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { RestClientBuilder } from '../data'
import { formatDateTimeISO } from '../utils/dateHelpers'

export default class HomepageService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getTodaySection(clientToken: string, activeCaseLoadId: string) {
    const [assignedRollCount, unassignedRollCount, movements] = await Promise.all([
      await this.prisonApiClientBuilder(clientToken).getRollCount(activeCaseLoadId),
      await this.prisonApiClientBuilder(clientToken).getRollCount(activeCaseLoadId, true),
      await this.prisonApiClientBuilder(clientToken).getMovements(activeCaseLoadId),
    ])

    const populationCount =
      assignedRollCount.reduce((total, block) => total + block.currentlyInCell, 0) +
      unassignedRollCount.reduce((total, block) => total + block.currentlyInCell, 0)

    return {
      unlockRollCount: populationCount - movements.in + movements.out,
      currentPopulationCount: populationCount,
      inTodayCount: movements.in,
      outTodayCount: movements.out,
      todayLastUpdated: formatDateTimeISO(new Date()),
    }
  }
}
