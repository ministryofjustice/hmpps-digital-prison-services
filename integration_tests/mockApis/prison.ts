import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationsMock } from '../../server/mocks/locationMock'
import { assignedRollCountMock, unassignedRollCountMock } from '../../server/mocks/rollCountMock'
import { movementsMock } from '../../server/mocks/movementsMock'

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

  stubRollCount: () => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/movements/rollcount/LEI`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: assignedRollCountMock,
      },
    })
  },

  stubRollCountUnassigned: () => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/movements/rollcount/LEI?unassigned=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: unassignedRollCountMock,
      },
    })
  },

  stubMovements: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/rollcount/LEI/movements`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsMock,
      },
    })
  },

  stubGetStaffRoles: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/staff/231232/LEI/roles`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsMock,
      },
    })
  },
}
