import { CaseLoad } from './caseLoad'
import { Location } from './location'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
}
