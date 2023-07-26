export interface CustomRequest {
  session: Session
}

export interface Session {
  userDetails: UserDetails
}

export interface UserDetails {
  activeCaseLoadId: string
  staffId: string
}
