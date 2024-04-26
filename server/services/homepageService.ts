import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { RestClientBuilder } from '../data'
import { WhereAboutsApiClient } from '../data/interfaces/whereAboutsApiClient'
import { KeyWorkerApiClient } from '../data/interfaces/keyWorkerApiClient'

export default class HomepageService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly whereAboutsApiClientBuilder: RestClientBuilder<WhereAboutsApiClient>,
    private readonly keyWorkerApiClientBuilder: RestClientBuilder<KeyWorkerApiClient>,
  ) {}

  public async getTodaySection(clientToken: string, activeCaseLoadId: string) {
    const [assignedRollCount, unassignedRollCount, movements] = await Promise.all([
      this.prisonApiClientBuilder(clientToken).getRollCount({ prisonId: activeCaseLoadId }),
      this.prisonApiClientBuilder(clientToken).getRollCount({ prisonId: activeCaseLoadId, unassigned: true }),
      this.prisonApiClientBuilder(clientToken).getMovements(activeCaseLoadId),
    ])

    const populationCount =
      assignedRollCount.reduce((total, block) => total + block.currentlyInCell + block.outOfLivingUnits, 0) +
      unassignedRollCount.reduce((total, block) => total + block.currentlyInCell + block.outOfLivingUnits, 0)

    return {
      unlockRollCount: populationCount - movements.in + movements.out,
      currentPopulationCount: populationCount,
      inTodayCount: movements.in,
      outTodayCount: movements.out,
      todayLastUpdated: new Date().toISOString(),
    }
  }

  public getWhereaboutsConfig(clientToken: string, activeCaseLoadId: string) {
    return this.whereAboutsApiClientBuilder(clientToken).getWhereaboutsConfig(activeCaseLoadId)
  }

  public getPrisonMigrationStatus(clientToken: string, activeCaseLoadId: string) {
    return this.keyWorkerApiClientBuilder(clientToken).getPrisonMigrationStatus(activeCaseLoadId)
  }

  public getStaffRoles(clientToken: string, activeCaseLoadId: string, staffId: number) {
    return this.prisonApiClientBuilder(clientToken).getStaffRoles(staffId, activeCaseLoadId)
  }
}
