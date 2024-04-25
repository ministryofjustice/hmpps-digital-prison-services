import RestClient from './restClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { BlockRollCount } from './interfaces/blockRollCount'
import { Movements } from './interfaces/movements'
import { StaffRole } from './interfaces/staffRole'
import { OffenderCell } from './interfaces/offenderCell'

export default class PrisonApiRestClient implements PrisonApiClient {
  constructor(private restClient: RestClient) {}

  private get<T>(args: object): Promise<T> {
    return this.restClient.get<T>(args)
  }

  private put<T>(args: object): Promise<T> {
    return this.restClient.put<T>(args)
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' })
  }

  getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' })
  }

  getRollCount({ prisonId, unassigned }: { prisonId: string; unassigned?: boolean }): Promise<BlockRollCount[]> {
    return this.get<BlockRollCount[]>({
      path: `/api/movements/rollcount/${prisonId}`,
      query: unassigned ? 'unassigned=true' : '',
    })
  }

  getMovements(prisonId: string): Promise<Movements> {
    return this.get<Movements>({ path: `/api/movements/rollcount/${prisonId}/movements` })
  }

  getEnrouteRollCount(prisonId: string): Promise<number> {
    return this.get<number>({ path: `/api/movements/rollcount/${prisonId}/enroute` })
  }

  getLocationsForPrison(prisonId: string): Promise<Location[]> {
    return this.get<Location[]>({ path: `/api/agencies/${prisonId}/locations` })
  }

  getAttributesForLocation(locationId: number): Promise<OffenderCell> {
    return this.get<OffenderCell>({ path: `/api/cell/${locationId}/attributes` })
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

  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.put<Record<string, string>>({ path: '/api/users/me/activeCaseLoad', data: caseLoad })
  }
}
