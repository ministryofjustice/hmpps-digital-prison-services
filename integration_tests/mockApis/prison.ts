import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationMock, locationsMock } from '../../server/mocks/locationMock'
import { assignedRollCountMock, unassignedRollCountMock } from '../../server/mocks/rollCountMock'
import { movementsMock } from '../../server/mocks/movementsMock'
import { mockStaffRoles } from '../../server/mocks/staffRolesMock'
import { movementsInMock } from '../../server/test/mocks/movementsInMock'
import { movementsOutMock } from '../../server/test/mocks/movementsOutMock'
import { movementsEnRouteMock } from '../../server/test/mocks/movementsEnRouteMock'
import { movementsInReceptionMock } from '../../server/test/mocks/movementsInReceptionMock'
import { movementsRecentMock } from '../../server/test/mocks/movementsRecentMock'
import { offenderCellHistoryMock } from '../../server/test/mocks/offenderCellHistoryMock'
import { userDetailsMock } from '../../server/test/mocks/userDetailsMock'
import { pagedListMock } from '../../server/test/mocks/pagedListMock'

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

  stubMovementsEnRoute: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/${prisonCode}/enroute`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsEnRouteMock,
      },
    })
  },

  stubOutToday: (livingUnitId = 'abc') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/livingUnit/${livingUnitId}/currently-out`,
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

  stubMovementsInReception: (prisonCode = 'LEI') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/prison/api/movements/rollcount/${prisonCode}/in-reception`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsInReceptionMock,
      },
    })
  },

  stubRecentMovements: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/prison/api/movements/offenders`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movementsRecentMock,
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

  stubGetOffenderCellHistory: (bookingId = 123) => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prison/api/bookings/${bookingId}/cell-history?page=0&size=2000`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedListMock(offenderCellHistoryMock),
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
