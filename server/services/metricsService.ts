import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { PrisonUser } from '../interfaces/prisonUser'

export default class MetricsService {
  constructor() {}

  private removeUndefinedEntries(obj: object): string {
    return JSON.stringify(Object.fromEntries(Object.entries(obj).filter(entry => entry[1])))
  }

  // This is intended to replicate the event in the old prisoner search service rather than use the audit service
  trackPrisonerSearchQuery({
    offenderNos,
    searchTerms,
    user,
  }: {
    offenderNos: string[]
    searchTerms: object
    user: PrisonUser
  }) {
    telemetry.trackEvent('PrisonerSearch', {
      offenderNos: JSON.stringify(offenderNos),
      filters: this.removeUndefinedEntries(searchTerms),
      username: user.username,
      caseLoadId: user.activeCaseLoad?.caseLoadId,
    })
  }

  trackGlobalSearchQuery({
    offenderNos,
    searchText,
    openFilterValues,
    user: { username, activeCaseLoad },
  }: {
    offenderNos: string[]
    searchText: string
    openFilterValues: object
    user: PrisonUser
  }) {
    telemetry.trackEvent('GlobalSearch', {
      offenderNos: JSON.stringify(offenderNos),
      searchText,
      filters: this.removeUndefinedEntries(openFilterValues),
      username,
      caseLoadId: activeCaseLoad?.caseLoadId,
    })
  }
}
