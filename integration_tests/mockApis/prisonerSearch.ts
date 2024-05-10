import { stubFor } from './wiremock'
import { prisonerSearchMock } from '../../server/test/mocks/prisonerSearchMock'

export default {
  stubPostSearchPrisonersById: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/prisoner-search/prisoner-search/prisoner-numbers',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerSearchMock,
      },
    })
  },
}
