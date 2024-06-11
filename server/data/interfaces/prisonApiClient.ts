import { Readable } from 'stream'
import { CaseLoad } from './caseLoad'
import { Location } from './location'
import { BlockRollCount } from './blockRollCount'
import { Movements } from './movements'
import { StaffRole } from './staffRole'
import { OffenderCell } from './offenderCell'
import { OffenderIn } from './offenderIn'
import { OffenderOut } from './offenderOut'
import { OffenderMovement } from './offenderMovement'
import { OffenderInReception } from './offenderInReception'
import { PagedList } from './pagedList'
import { BedAssignment } from './bedAssignment'
import { UserDetail } from './userDetail'
import PrisonRollCount from './prisonRollCount'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  getRollCount(
    prisonId: string,
    options?: { unassigned?: boolean; wingOnly?: boolean; showCells?: boolean; parentLocationId?: number },
  ): Promise<BlockRollCount[]>
  getLocation(locationId: string): Promise<Location>
  getAttributesForLocation(locationId: number): Promise<OffenderCell>
  getMovements(prisonId: string): Promise<Movements>
  getRecentMovements(prisonerNumbers: string[]): Promise<OffenderMovement[]>
  getMovementsIn(prisonId: string, movementDate: string): Promise<OffenderIn[]>
  getMovementsOut(prisonId: string, movementDate: string): Promise<OffenderOut[]>
  getMovementsEnRoute(prisonId: string): Promise<OffenderMovement[]>
  getMovementsInReception(prisonId: string): Promise<OffenderInReception[]>
  getStaffRoles(staffId: number, agencyId: string): Promise<StaffRole[]>
  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>>
  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable>
  getOffenderCellHistory(bookingId: number, params?: { page: number; size: number }): Promise<PagedList<BedAssignment>>
  getUserDetailsList(usernames: string[]): Promise<UserDetail[]>
  getPrisonersCurrentlyOutOfLivingUnit(livingUnitId: string): Promise<OffenderOut[]>
  getPrisonersCurrentlyOutOfPrison(prisonId: string): Promise<OffenderOut[]>
  getPrisonRollCount(prisonId: string): Promise<PrisonRollCount>
  getPrisonRollCountForLocation(prisonId: string, locationId: string): Promise<PrisonRollCount>
}
