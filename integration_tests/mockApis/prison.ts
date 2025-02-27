import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationsMock } from '../../server/mocks/locationMock'

import { userDetailsMock } from '../../server/test/mocks/userDetailsMock'
import { prisonEstablishmentRollSummaryMock } from '../../server/mocks/prisonRollCountSummaryMock'

export default {
  stubUserCaseLoads: (caseLoads: CaseLoad[] = []) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/users/me/caseLoads\\?allCaseloads=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseLoads.length > 0 ? caseLoads : [],
      },
    })
  },

  stubUserLocations: (locations: Location[] = locationsMock) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/users/me/locations`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations.length > 0 ? locations : [],
      },
    })
  },

  stubPrisonRollCountSummary: ({ prisonCode = 'LEI' } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/prison/roll-count/${prisonCode}/summary`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { ...prisonEstablishmentRollSummaryMock, prisonId: prisonCode },
      },
    })
  },

  stubSetActiveCaseload: (status = 200) => {
    return stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/prison/api/users/me/activeCaseLoad`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    })
  },

  getUserDetailsList: () => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/prison/api/users/list',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: userDetailsMock,
      },
    })
  },
}
