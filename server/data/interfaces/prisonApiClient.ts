import { CaseLoad } from './caseLoad'
import { Location } from './location'
import EstablishmentRollSummary from '../../services/interfaces/establishmentRollService/EstablishmentRollSummary'
import { LatestArrivalDateInfo } from './latestArrivalDateInfo'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>>
  getPrisonRollCountSummary(prisonId: string): Promise<EstablishmentRollSummary>
  getLatestArrivalDates(prisonerNumbers: string[]): Promise<LatestArrivalDateInfo[]>
}
