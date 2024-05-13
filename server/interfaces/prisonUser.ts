import { CaseLoad } from '../data/interfaces/caseLoad'
import { Location } from '../data/interfaces/location'

export type AuthSource = 'nomis' | 'delius' | 'external'

export interface PrisonUser {
  authSource: AuthSource
  username: string
  userId: string
  name: string
  displayName: string
  userRoles: string[]
  token?: string
  staffId: number
  activeCaseLoad: CaseLoad
  activeCaseLoadId: string
  caseLoads: CaseLoad[]
  locations: Location[]
  showFeedbackBanner: boolean
}
