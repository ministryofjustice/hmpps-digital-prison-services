import { TelemetryClient } from 'applicationinsights'
import MetricsService from './metricsService'
import { PrisonUser } from '../interfaces/prisonUser'

describe('metricsService', () => {
  it('Tracks the prisoner search query', () => {
    const client = { trackEvent: jest.fn() } as unknown as TelemetryClient
    const service = new MetricsService(client)
    service.trackPrisonerSearchQuery({
      offenderNos: ['ABC'],
      searchTerms: {
        foo: 'bar',
        ignoreMe: undefined,
      },
      user: { activeCaseLoad: { caseLoadId: 'MDI' }, username: 'UserName' } as PrisonUser,
    })

    expect(client.trackEvent).toHaveBeenCalledWith({
      name: 'PrisonerSearch',
      properties: {
        caseLoadId: 'MDI',
        filters: {
          foo: 'bar',
        },
        offenderNos: ['ABC'],
        username: 'UserName',
      },
    })
  })

  it('Tracks the global search query', () => {
    const client = { trackEvent: jest.fn() } as unknown as TelemetryClient
    const service = new MetricsService(client)
    service.trackGlobalSearchQuery({
      offenderNos: ['ABC'],
      openFilterValues: {
        foo: 'bar',
        ignoreMe: undefined,
      },
      user: { activeCaseLoad: { caseLoadId: 'MDI' }, username: 'UserName' } as PrisonUser,
      searchText: 'Search text',
    })

    expect(client.trackEvent).toHaveBeenCalledWith({
      name: 'GlobalSearch',
      properties: {
        caseLoadId: 'MDI',
        filters: {
          foo: 'bar',
        },
        offenderNos: ['ABC'],
        username: 'UserName',
        searchText: 'Search text',
      },
    })
  })
})
