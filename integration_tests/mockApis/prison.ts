import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationMock, locationsMock } from '../../server/mocks/locationMock'
import { assignedRollCountMock, unassignedRollCountMock } from '../../server/mocks/rollCountMock'
import { movementsMock } from '../../server/mocks/movementsMock'
import { mockStaffRoles } from '../../server/mocks/staffRolesMock'
import { movementsInMock } from '../../server/test/mocks/movementsInMock'
import { movementsOutMock } from '../../server/test/mocks/movementsOutMock'

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

  stubRollCount: ({ prisonCode = 'LEI', payload = assignedRollCountMock, query = '' } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/movements/rollcount/${prisonCode}${query}`,
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

  stubMovementsIn: (prisonCode = 'LEI') => {
    const today = new Date().toISOString().split('T')[0]
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/${prisonCode}/in/${today}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsInMock,
      },
    })
  },

  stubMovementsOut: (prisonCode = 'LEI') => {
    const today = new Date().toISOString().split('T')[0]
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/${prisonCode}/out/${today}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsOutMock,
      },
    })
  },

  stubEnrouteRollCount: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/rollcount/${prisonCode}/enroute`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: 1,
      },
    })
  },

  stubGetLocationsForPrison: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/agencies/${prisonCode}/locations`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [{ description: 'CSWAP', locationId: 1 }],
      },
    })
  },

  stubGetLocation: ({ locationId = 123, payload = locationMock } = {}) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/locations/${locationId}`,
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

  getAttributesForLocation: (locationId = 1) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/cell/${locationId}/attributes`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { noOfOccupants: 31 },
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
