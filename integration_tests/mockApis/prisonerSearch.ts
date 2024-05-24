import { stubFor } from './wiremock'
import { prisonerSearchMock } from '../../server/test/mocks/prisonerSearchMock'
import { pagedListMock } from '../../server/test/mocks/pagedListMock'

export default {
  stubPostSearchPrisonersById: () => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/prisoner-search/prisoner-search/prisoner-numbers',
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

  stubPostAttributeSearch: () => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/prisoner-search/attribute-search?size=2000',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: pagedListMock(prisonerSearchMock),
      },
    })
  },
}
