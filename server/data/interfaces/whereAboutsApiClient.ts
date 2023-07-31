import { WhereAboutsConfig } from './whereAboutsConfig'

export interface WhereAboutsApiClient {
  getWhereaboutsConfig(activeCaseLoadId: string): Promise<WhereAboutsConfig>
}
