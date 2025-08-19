import { CaseLoad } from './caseLoad'
import { Location } from './location'
import EstablishmentRollSummary from '../../services/interfaces/establishmentRollService/EstablishmentRollSummary'
import { LatestArrivalDateInfo } from './latestArrivalDateInfo'

export interface PrisonApiClient {
  getUserCaseLoads(token: string): Promise<CaseLoad[]>
  getUserLocations(token: string): Promise<Location[]>
  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>>
  getPrisonRollCountSummary(token: string, prisonId: string): Promise<EstablishmentRollSummary>
  getLatestArrivalDates(token: string, prisonerNumbers: string[]): Promise<LatestArrivalDateInfo[]>
}
