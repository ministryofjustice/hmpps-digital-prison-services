import { WhereAboutsApiClient } from './interfaces/whereAboutsApiClient'
import { WhereAboutsConfig } from './interfaces/whereAboutsConfig'
import RestClient from './restClient'

export default class WhereAboutsApiRestClient implements WhereAboutsApiClient {
  constructor(private restClient: RestClient) {}

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  async getWhereaboutsConfig(activeCaseLoadId: string): Promise<WhereAboutsConfig> {
    return this.get<WhereAboutsConfig>({ path: `/agencies/${activeCaseLoadId}/locations/whereabouts` })
  }
}
