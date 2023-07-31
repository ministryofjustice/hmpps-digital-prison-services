import { KeyWorkerPrisonStatus } from './keyWorkerPrisonStatus'

export interface KeyWorkerApiClient {
  getPrisonMigrationStatus(prisonId: string): Promise<KeyWorkerPrisonStatus>
}
