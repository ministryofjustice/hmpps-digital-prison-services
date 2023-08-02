import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import ContentfulService from './contentfulService'
import {
  whatsNewPostCollectionMock,
  whatsNewPostMock,
  whatsNewPostsCollectionMock,
  whatsNewPostsMock,
} from '../mocks/whatsNewPostsMock'

describe('ContentfulService', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    contentfulService = new ContentfulService(new ApolloClient<unknown>({ cache: new InMemoryCache() }))
  })

  it('should get whats new posts', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue(whatsNewPostsCollectionMock)

    const whatsNewData = await contentfulService.getWhatsNewPosts(1, 3, 0, 'LEI')

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          limit: 3,
          skip: 0,
          condition: { OR: [{ prisons_exists: false }, { prisons_contains_some: 'LEI' }] },
        },
      }),
    )
    expect(whatsNewData.whatsNewPosts).toEqual(whatsNewPostsMock)
  })

  it('should get whats new post', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue(whatsNewPostCollectionMock)
    const slug = 'whats-new-one'

    const post = await contentfulService.getWhatsNewPost(slug)

    expect(apolloSpy).toHaveBeenCalled()
    expect(post).toEqual(whatsNewPostMock)
  })
})
