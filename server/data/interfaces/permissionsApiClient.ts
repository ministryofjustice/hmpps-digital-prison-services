export interface PermissionsApiClient {
  checkHighProfilePrisonerStatuses(prisonerNumbersToCheck: string[]): Promise<Set<string>>
}
