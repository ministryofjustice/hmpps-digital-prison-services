import ContentfulService from './contentfulService'
import { contentfulWhatsNewPostEntriesMock } from '../mocks/whatsNewPostsMock'

describe('ContentfulService', () => {
  let contentfulService: ContentfulService

  beforeEach(() => {
    contentfulService = new ContentfulService()
  })

  it('should get whats new posts', async () => {
    const contentfulSpy = jest
      .spyOn<any, string>(contentfulService['contentfulApiClient'], 'getEntries')
      .mockReturnValue(contentfulWhatsNewPostEntriesMock)
    const posts = await contentfulService.getWhatsNewPosts({ limit: 3 })

    expect(contentfulSpy).toHaveBeenCalledWith({
      content_type: 'whatsNewPost',
      order: ['-fields.date'],
      limit: 3,
    })
    expect(posts).toEqual([
      {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: '<p>body</p>',
        date: '2023-07-27',
        prisons: ['LEI'],
      },
      {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: '<p>body</p>',
        date: '2023-07-27',
        prisons: ['LEI'],
      },
      {
        title: 'title',
        summary: 'summary',
        slug: 'slug',
        body: '<p>body</p>',
        date: '2023-07-27',
        prisons: ['LEI'],
      },
    ])
  })

  it('should get whats new post', async () => {
    const contentfulSpy = jest
      .spyOn<any, string>(contentfulService['contentfulApiClient'], 'getEntries')
      .mockReturnValue(contentfulWhatsNewPostEntriesMock)
    const slug = 'example-post'
    const post = await contentfulService.getWhatsNewPost(slug)

    expect(contentfulSpy).toHaveBeenCalledWith({
      content_type: 'whatsNewPost',
      'fields.slug': slug,
    })
    expect(post).toEqual({
      title: 'title',
      summary: 'summary',
      slug: 'slug',
      body: '<p>body</p>',
      date: '2023-07-27',
      prisons: ['LEI'],
    })
  })
})
