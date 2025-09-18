import { ApolloClient, ObservableQuery } from '@apollo/client'
import ContentfulService from './contentfulService'
import {
  whatsNewPostCollectionMock,
  whatsNewPostMock,
  whatsNewPostsCollectionMock,
  whatsNewPostsMock,
} from '../mocks/whatsNewPostsMock'
import { managedPagesCollectionMock, managedPagesMock } from '../mocks/managedPagesMock'

jest.mock('@apollo/client/core')

describe('ContentfulService', () => {
  let contentfulService: ContentfulService
  let apolloClient: jest.Mocked<ApolloClient>

  beforeEach(() => {
    apolloClient = new ApolloClient(null) as jest.Mocked<ApolloClient>
    contentfulService = new ContentfulService(apolloClient)
  })

  const mockApolloQuery = (response: ObservableQuery.Result<unknown>) => {
    return jest.spyOn(apolloClient, 'query').mockResolvedValue(response)
  }

  it('should get whats new posts', async () => {
    const apolloSpy = mockApolloQuery(whatsNewPostsCollectionMock as ObservableQuery.Result<unknown>)

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
    const apolloSpy = jest.spyOn(apolloClient, 'query').mockResolvedValue(whatsNewPostsCollectionMock)

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
    const apolloSpy = mockApolloQuery(whatsNewPostCollectionMock as ObservableQuery.Result<unknown>)
    const slug = 'whats-new-one'

    const post = await contentfulService.getWhatsNewPost(slug)

    expect(apolloSpy).toHaveBeenCalled()
    expect(post).toEqual(whatsNewPostMock)
  })

  it('should get managed page', async () => {
    const apolloSpy = mockApolloQuery(managedPagesCollectionMock)

    const pages = await contentfulService.getManagedPage('title-one')

    expect(apolloSpy).toHaveBeenCalled()
    expect(pages).toEqual(managedPagesMock[0])
  })

  it.each([
    { environment: 'DEV', query: { development: true } },
    { environment: 'PRE-PRODUCTION', query: { preProd: true } },
    { environment: 'PRODUCTION', query: { production: true } },
  ])(
    'Should get the outage banner for the users caseload for the current environment',
    async ({ environment, query }) => {
      const apolloSpy = mockApolloQuery({ data: { outageBannerCollection: [] } } as ObservableQuery.Result<unknown>)

      await contentfulService.getOutageBanner('LEI', environment)

      expect(apolloSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            condition: { AND: [{ OR: [{ prisons_exists: false }, { prisons_contains_some: 'LEI' }] }, query] },
          },
        }),
      )
    },
  )

  it.each([
    { environment: 'DEV', query: { development: true } },
    { environment: 'PRE-PRODUCTION', query: { preProd: true } },
    { environment: 'PRODUCTION', query: { production: true } },
  ])(
    'Should get the outage banner for the users without a caseload for the current environment',
    async ({ environment, query }) => {
      const apolloSpy = mockApolloQuery({ data: { outageBannerCollection: [] } } as ObservableQuery.Result<unknown>)

      await contentfulService.getOutageBanner(undefined, environment)

      expect(apolloSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            condition: { AND: [{ prisons_exists: false }, query] },
          },
        }),
      )
    },
  )
})
