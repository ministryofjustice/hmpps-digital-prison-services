import { stubFor } from './wiremock'
import { prisonHierarchyMock } from '../../server/mocks/locationMock'
import PrisonHierarchyDto from '../../server/data/interfaces/prisonHierarchyDto'

export default {
  stubLocationsInsidePrisonPing: (httpStatus = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/locations-api/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),

  stubUserLocations: (locations: PrisonHierarchyDto[] = prisonHierarchyMock, prisonPattern: string = '[^/]+') => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/locations-api/locations/prison/${prisonPattern}/residential-first-level`,
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
}
