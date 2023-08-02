import { stubFor } from './wiremock'
import { whatsNewPostCollectionMock, whatsNewPostsCollectionMock } from '../../server/mocks/whatsNewPostsMock'

export default {
  stubWhatsNewPosts: (list = true) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/contentful/.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: list ? whatsNewPostsCollectionMock : whatsNewPostCollectionMock,
      },
    })
  },
}
