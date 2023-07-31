import { KeyWorkerApiClient } from './interfaces/keyWorkerApiClient'
import { KeyWorkerPrisonStatus } from './interfaces/keyWorkerPrisonStatus'
import RestClient from './restClient'

export default class KeyWorkerApiRestClient implements KeyWorkerApiClient {
  constructor(private restClient: RestClient) {}

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  async getPrisonMigrationStatus(prisonId: string): Promise<KeyWorkerPrisonStatus> {
    return this.get<KeyWorkerPrisonStatus>({ path: `/key-worker/prison/${prisonId}` })
  }
}
