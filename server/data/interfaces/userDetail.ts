export interface UserDetail {
  staffId: number
  username: string
  firstName: string
  lastName: string
  thumbnailId?: number
  activeCaseLoadId?: string
  accountStatus: 'ACTIVE' | 'INACT' | 'SUS' | 'CAREER' | 'MAT' | 'SAB' | 'SICK'
  lockDate: string
  expiryDate?: string
  lockedFlag?: boolean
  expiredFlag?: boolean
  active: boolean
}
