import { stubFor } from './wiremock'
import { locationPrisonRollCountMock } from '../../server/mocks/locationPrisonRollCountMock'
import { locationPrisonRollCountForWingWithSpurMock } from '../../server/mocks/locationPrisonRollCountForWingWithSpurMock'
import { prisonerInLocation } from '../../server/test/mocks/prisonersInLocation'
import { internalLocationMock } from '../../server/mocks/internalLocationMock'
import { ActiveAgencies } from '../../server/data/locationsInsidePrisonApiClient'

export default {
  stubActivePrisons: (activeAgencies: ActiveAgencies) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/locations/info',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activeAgencies || { activeAgencies: [] },
      },
    })
  },

  stubLocationPrisonRollCount: ({ prisonCode = 'LEI', payload = locationPrisonRollCountMock } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/locations/prison/roll-count/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: payload,
      },
    })
  },

  stubLocationPrisonRollCountForLanding: ({
    prisonCode = 'LEI',
    landingId = '01922dda-5d40-7720-a3f5-a1e37e0b8389',
    payload = locationPrisonRollCountForWingWithSpurMock,
  } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/locations/prison/roll-count/${prisonCode}/cells-only/${landingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: payload,
      },
    })
  },

  stubLocationsOutToday: (locationId = '01922e9a-ffd2-77cb-ba6b-3c9c9b623194') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/locations/prisoner-locations/id/${locationId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerInLocation,
      },
    })
  },

  stubInternalLocation: ({
    locationId = '01922e9a-ffd2-77cb-ba6b-3c9c9b623194',
    payload = internalLocationMock,
  } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/locations/locations/${locationId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: payload,
      },
    })
  },
}
