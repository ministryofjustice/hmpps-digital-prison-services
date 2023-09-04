import { stubFor } from './wiremock'
import { whatsNewPostCollectionMock, whatsNewPostsCollectionMock } from '../../server/mocks/whatsNewPostsMock'
import { outageBannerCollectionMock } from '../../server/mocks/outageBannerMock'
import { managedPagesCollectionMock } from '../../server/mocks/managedPagesMock'

export default {
  stubWhatsNewPosts: (list = true) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/contentful/.*',
        bodyPatterns: [
          {
            contains: 'whatsNew',
          },
        ],
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

  stubOutageBanner: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/contentful/.*',
        bodyPatterns: [
          {
            contains: 'outageBanner',
          },
        ],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: outageBannerCollectionMock,
      },
    })
  },

  stubManagedPage: () => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: '/contentful/.*',
        bodyPatterns: [
          {
            contains: 'managedPage',
          },
        ],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: managedPagesCollectionMock,
      },
    })
  },
}
