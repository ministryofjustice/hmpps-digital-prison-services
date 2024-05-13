import * as querystring from 'querystring'
import { Readable } from 'stream'
import RestClient from './restClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { BlockRollCount } from './interfaces/blockRollCount'
import { Movements } from './interfaces/movements'
import { StaffRole } from './interfaces/staffRole'
import { OffenderCell } from './interfaces/offenderCell'
import { OffenderIn } from './interfaces/offenderIn'

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

  getRollCount(
    prisonId: string,
    queryOptions: { unassigned?: boolean; wingOnly?: boolean; showCells?: boolean; parentLocationId?: number } = {},
  ): Promise<BlockRollCount[]> {
    return this.get<BlockRollCount[]>({
      path: `/api/movements/rollcount/${prisonId}`,
      query: querystring.stringify(queryOptions),
    })
  }

  getMovements(prisonId: string): Promise<Movements> {
    return this.get<Movements>({ path: `/api/movements/rollcount/${prisonId}/movements` })
  }

  getMovementsIn(prisonId: string, movementDate: string): Promise<OffenderIn[]> {
    return this.get<OffenderIn[]>({ path: `/api/movements/${prisonId}/in/${movementDate.split('T')[0]}` })
  }

  getEnrouteRollCount(prisonId: string): Promise<number> {
    return this.get<number>({ path: `/api/movements/rollcount/${prisonId}/enroute` })
  }

  getLocationsForPrison(prisonId: string): Promise<Location[]> {
    return this.get<Location[]>({ path: `/api/agencies/${prisonId}/locations` })
  }

  getLocation(locationId: string): Promise<Location> {
    return this.get<Location>({ path: `/api/locations/${locationId}` })
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

  async getPrisonerImage(prisonerNumber: string, fullSizeImage: boolean): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${prisonerNumber}/image/data?fullSizeImage=${fullSizeImage}`,
    })
  }
}
