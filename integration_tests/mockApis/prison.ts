import { format } from 'date-fns/format'
import { subDays } from 'date-fns'
import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { userDetailsMock } from '../../server/test/mocks/userDetailsMock'
import { prisonEstablishmentRollSummaryMock } from '../../server/mocks/prisonRollCountSummaryMock'

export default {
  stubPrisonApiPing: (httpStatus = 200): SuperAgentRequest => stubPing('/prison', httpStatus),

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
        urlPath: '/prison/api/users/me/activeCaseLoad',
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

  stubLatestArrivalDates: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPath: '/prison/api/movements/offenders/latest-arrival-date',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            offenderNo: 'G4879UP',
            latestArrivalDate: format(subDays(Date.now(), 3), 'yyyy-MM-dd'),
          },
          {
            offenderNo: 'G6333VK',
            latestArrivalDate: format(subDays(Date.now(), 2), 'yyyy-MM-dd'),
          },
        ],
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
