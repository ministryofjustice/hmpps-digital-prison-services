import { CaseLoad } from './caseLoad'
import { Location } from './location'
import EstablishmentRollSummary from '../../services/interfaces/establishmentRollService/EstablishmentRollSummary'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>>
  getPrisonRollCountSummary(prisonId: string): Promise<EstablishmentRollSummary>
}
