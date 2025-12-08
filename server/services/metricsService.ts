import { TelemetryClient } from 'applicationinsights'
import { PrisonUser } from '../interfaces/prisonUser'

export default class MetricsService {
  constructor(private readonly telemetryClient?: TelemetryClient) {}

  private removeUndefinedEntries(obj: object) {
    return Object.fromEntries(Object.entries(obj).filter(entry => entry[1]))
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
    this.telemetryClient?.trackEvent({
      name: `PrisonerSearch`,
      properties: {
        offenderNos,
        filters: this.removeUndefinedEntries(searchTerms),
        username: user.username,
        caseLoadId: user.activeCaseLoad?.caseLoadId,
      },
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
    this.telemetryClient?.trackEvent({
      name: `GlobalSearch`,
      properties: {
        offenderNos,
        searchText,
        filters: this.removeUndefinedEntries(openFilterValues),
        username,
        caseLoadId: activeCaseLoad?.caseLoadId,
      },
    })
  }
}
