import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/interfaces/caseLoad'
import { Location } from '../../server/data/interfaces/location'
import { locationsMock } from '../../server/mocks/locationMock'

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
}
