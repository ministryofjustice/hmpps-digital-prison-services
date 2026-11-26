import config from '../config'
import RestClient from './restClient'
import type { PermissionsApiClient } from './interfaces/permissionsApiClient'

export interface HighProfilePrisonerRequest {
  prisonerNumbersToCheck: string[]
}
export interface HighProfilePrisonerResponse {
  highProfilePrisoners: string[]
}

export default class PermissionsApiRestClient extends RestClient implements PermissionsApiClient {
  constructor(token: string) {
    super('Permissions API', config.apis.permissionsApi, token)
  }

  async checkHighProfilePrisonerStatuses(prisonerNumbersToCheck: string[]): Promise<Set<string>> {
    const statuses = await this.post<HighProfilePrisonerResponse>(
      {
        path: '/api/high-profile-prisoners',
        data: { prisonerNumbersToCheck } satisfies HighProfilePrisonerRequest,
      },
      this.token,
    )
    return new Set(statuses.highProfilePrisoners)
  }
}
