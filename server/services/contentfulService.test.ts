import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import ContentfulService from './contentfulService'
import {
  whatsNewPostCollectionMock,
  whatsNewPostMock,
  whatsNewPostsCollectionMock,
  whatsNewPostsMock,
} from '../mocks/whatsNewPostsMock'
import { managedPagesCollectionMock, managedPagesMock } from '../mocks/managedPagesMock'

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

  it('should get whats new posts without an active caseload id', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue(whatsNewPostsCollectionMock)

    const whatsNewData = await contentfulService.getWhatsNewPosts(1, 3, 0, undefined)

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          limit: 3,
          skip: 0,
          condition: { prisons_exists: false },
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

  it('should get managed page', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue(managedPagesCollectionMock)

    const pages = await contentfulService.getManagedPage('title-one')

    expect(apolloSpy).toHaveBeenCalled()
    expect(pages).toEqual(managedPagesMock[0])
  })

  it('Should get the outage banner for the users caseload', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { outageBannerCollection: [] } })

    await contentfulService.getOutageBanner('LEI')

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { OR: [{ prisons_exists: false }, { prisons_contains_some: 'LEI' }] },
        },
      }),
    )
  })

  it('Should get the outage banner for the users without a caseload', async () => {
    const apolloSpy = jest
      .spyOn<any, string>(contentfulService['apolloClient'], 'query')
      .mockResolvedValue({ data: { outageBannerCollection: [] } })

    await contentfulService.getOutageBanner(undefined)

    expect(apolloSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          condition: { prisons_exists: false },
        },
      }),
    )
  })
})
