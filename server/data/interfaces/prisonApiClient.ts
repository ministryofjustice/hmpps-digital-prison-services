import { CaseLoad } from './caseLoad'
import { Location } from './location'
import { BlockRollCount } from './blockRollCount'
import { Movements } from './movements'

export interface PrisonApiClient {
  getUserCaseLoads(): Promise<CaseLoad[]>
  getUserLocations(): Promise<Location[]>
  getRollCount(prisonId: string, unassigned?: boolean): Promise<BlockRollCount[]>
  getMovements(prisonId: string): Promise<Movements>
}
