import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'
import locationMock from '../../server/mocks/locationMock'
import PrisonHierarchyDto from '../../server/data/interfaces/prisonHierarchyDto'

export default {
  stubLocationsInsidePrisonPing: (httpStatus = 200): SuperAgentRequest =>
    stubPing('/locationsinsideprison', httpStatus),

  stubUserLocations: (locations: PrisonHierarchyDto[] = locationMock, prisonPattern: string = '[^/]+') => {
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
