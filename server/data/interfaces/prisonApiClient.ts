import { Readable } from 'stream'
import { CaseLoad } from './caseLoad'
import { Location } from './location'
import { Movements } from './movements'
import { OffenderIn } from './offenderIn'
import { OffenderOut } from './offenderOut'
import { OffenderMovement } from './offenderMovement'
import { OffenderInReception } from './offenderInReception'
import { PagedList } from './pagedList'
import { BedAssignment } from './bedAssignment'
import { UserDetail } from './userDetail'
import PrisonRollCount from './prisonRollCount'
import EstablishmentRollSummary from '../../services/interfaces/establishmentRollService/EstablishmentRollSummary'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  getLocation(locationId: string): Promise<Location>
  getMovements(prisonId: string): Promise<Movements>
  getRecentMovements(prisonerNumbers: string[]): Promise<OffenderMovement[]>
  getMovementsIn(prisonId: string, movementDate: string): Promise<OffenderIn[]>
  getMovementsOut(prisonId: string, movementDate: string): Promise<OffenderOut[]>
  getMovementsEnRoute(prisonId: string): Promise<OffenderMovement[]>
  getMovementsInReception(prisonId: string): Promise<OffenderInReception[]>
  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>>
  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable>
  getOffenderCellHistory(bookingId: number, params?: { page: number; size: number }): Promise<PagedList<BedAssignment>>
  getUserDetailsList(usernames: string[]): Promise<UserDetail[]>
  getPrisonersCurrentlyOutOfLivingUnit(livingUnitId: string): Promise<OffenderOut[]>
  getPrisonersCurrentlyOutOfPrison(prisonId: string): Promise<OffenderOut[]>
  getPrisonRollCount(prisonId: string): Promise<PrisonRollCount>
  getPrisonRollCountForLocation(prisonId: string, locationId: string): Promise<PrisonRollCount>
  getPrisonRollCountSummary(prisonId: string): Promise<EstablishmentRollSummary>
}
