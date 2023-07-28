import { stubFor } from './wiremock'
import { contentfulWhatsNewPostEntriesMock } from '../../server/mocks/whatsNewPostsMock'

export default {
  stubWhatsNewPosts: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/contentful/.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: contentfulWhatsNewPostEntriesMock,
      },
    })
  },
}
