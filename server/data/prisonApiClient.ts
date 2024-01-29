import RestClient from './restClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { BlockRollCount } from './interfaces/blockRollCount'
import { Movements } from './interfaces/movements'
import { StaffRole } from './interfaces/staffRole'

export default class PrisonApiRestClient implements PrisonApiClient {
  constructor(private restClient: RestClient) {}

  private async get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private async put<T>(args: object): Promise<T> {
    return this.restClient.put<T>(args)
  }

  async getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
  }

  async getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' })
  }

  async getRollCount(prisonId: string, unassigned: boolean): Promise<BlockRollCount[]> {
    return this.get<BlockRollCount[]>({
      path: `/api/movements/rollcount/${prisonId}`,
      query: unassigned ? 'unassigned=true' : '',
    })
  }

  async getMovements(prisonId: string): Promise<Movements> {
    return this.get<Movements>({ path: `/api/movements/rollcount/${prisonId}/movements` })
  }

  async getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]> {
    try {
      return await this.get<StaffRole[]>({ path: `/api/staff/${staffId}/${agencyId}/roles` })
    } catch (error) {
      if (error.status === 403 || error.status === 404) {
        // can happen for CADM (central admin) users
        return []
      }
      throw error
    }
  }

  async setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.put<Record<string, string>>({ path: '/api/users/me/activeCaseLoad', data: caseLoad })
  }
}
