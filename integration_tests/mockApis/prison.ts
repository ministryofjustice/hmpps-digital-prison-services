import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationsMock } from '../../server/mocks/locationMock'
import { assignedRollCountMock, unassignedRollCountMock } from '../../server/mocks/rollCountMock'
import { movementsMock } from '../../server/mocks/movementsMock'
import { mockStaffRoles } from '../../server/mocks/staffRolesMock'

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

  stubRollCount: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/movements/rollcount/${prisonCode}`,
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

  stubRollCountUnassigned: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/movements/rollcount/${prisonCode}?unassigned=true`,
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

  stubMovements: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/rollcount/${prisonCode}/movements`,
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

  stubGetStaffRoles: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/staff/231232/LEI/roles`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: mockStaffRoles,
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
}
