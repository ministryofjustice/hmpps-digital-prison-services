import { CaseLoad } from '../data/interfaces/caseLoad'
import { LocationViewmodel } from '../services/userService'

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
  locations: LocationViewmodel[]
  showFeedbackBanner: boolean
}
