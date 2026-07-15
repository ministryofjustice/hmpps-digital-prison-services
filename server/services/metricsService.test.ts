import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import MetricsService from './metricsService'
import { PrisonUser } from '../interfaces/prisonUser'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => ({
  telemetry: {
    trackEvent: jest.fn(),
  },
}))

describe('metricsService', () => {
  const trackEventMock = telemetry.trackEvent as jest.Mock

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Tracks the prisoner search query', () => {
    const service = new MetricsService()
    service.trackPrisonerSearchQuery({
      offenderNos: ['ABC'],
      searchTerms: {
        foo: 'bar',
        ignoreMe: undefined,
      },
      user: { activeCaseLoad: { caseLoadId: 'MDI' }, username: 'UserName' } as PrisonUser,
    })

    expect(trackEventMock).toHaveBeenCalledWith('PrisonerSearch', {
      caseLoadId: 'MDI',
      filters: JSON.stringify({ foo: 'bar' }),
      offenderNos: JSON.stringify(['ABC']),
      username: 'UserName',
    })
  })

  it('Tracks the global search query', () => {
    const service = new MetricsService()
    service.trackGlobalSearchQuery({
      offenderNos: ['ABC'],
      openFilterValues: {
        foo: 'bar',
        ignoreMe: undefined,
      },
      user: { activeCaseLoad: { caseLoadId: 'MDI' }, username: 'UserName' } as PrisonUser,
      searchText: 'Search text',
    })

    expect(trackEventMock).toHaveBeenCalledWith('GlobalSearch', {
      caseLoadId: 'MDI',
      filters: JSON.stringify({ foo: 'bar' }),
      offenderNos: JSON.stringify(['ABC']),
      username: 'UserName',
      searchText: 'Search text',
    })
  })
})
