import { CaseLoad } from './caseLoad'
import { Location } from './location'
import { BlockRollCount } from './blockRollCount'
import { Movements } from './movements'
import { StaffRole } from './staffRole'
import { OffenderCell } from './offenderCell'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  getRollCount(prisonId: string, options?: { unassigned?: boolean; wingOnly?: boolean }): Promise<BlockRollCount[]>
  getEnrouteRollCount(prisonId: string): Promise<number>
  getLocationsForPrison(prisonId: string): Promise<Location[]>
  getAttributesForLocation(locationId: number): Promise<OffenderCell>
  getMovements(prisonId: string): Promise<Movements>
  getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]>
  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>>
}
