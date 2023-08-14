import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { ApolloClient, gql } from '@apollo/client/core'
import { WhatsNewData } from '../data/interfaces/whatsNewData'
import { WhatsNewPost, WhatsNewPostApollo } from '../data/interfaces/whatsNewPost'
import { OutageBannerApollo } from '../data/interfaces/outageBanner'

export default class ContentfulService {
  constructor(private readonly apolloClient: ApolloClient<unknown>) {}

  /**
   * Get list of `whatsNewPost` entries.
   *
   * Ordered by `date` descending (latest first)
   *
   * @param currentPage
   * @param pageSize
   * @param offset
   * @param activeCaseLoadId
   */
  public async getWhatsNewPosts(
    currentPage: number,
    pageSize: number,
    offset: number,
    activeCaseLoadId: string,
  ): Promise<WhatsNewData> {
    const filter = { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }

    const getWhatsNewPostsQuery = gql`
      query Posts($limit: Int!, $skip: Int!, $condition: WhatsNewPostFilter!) {
        whatsNewPostCollection(limit: $limit, skip: $skip, where: $condition, order: date_DESC) {
          total
          limit
          skip
          items {
            title
            slug
            summary
            date
          }
        }
      }
    `

    const { items, total } = (
      await this.apolloClient.query({
        query: getWhatsNewPostsQuery,
        variables: { limit: pageSize, skip: offset, condition: filter },
      })
    ).data.whatsNewPostCollection

    const totalPages = Math.ceil(total / pageSize)
    const pages = [...Array.from({ length: totalPages }, (_, i) => i + 1)].map(page => {
      return {
        text: `${page}`,
        href: `?page=${page}`,
        selected: currentPage === page,
      }
    })
    const pagination = {
      itemDescription: 'post',
      previous: currentPage > 1 ? { href: `?page=${currentPage - 1}`, text: 'Previous' } : undefined,
      next: currentPage < totalPages ? { href: `?page=${currentPage + 1}`, text: 'Next' } : undefined,
      page: currentPage,
      offset,
      pageSize,
      totalPages,
      totalElements: total,
      elementsOnPage: 10,
      pages,
    }

    return {
      whatsNewPosts: items,
      pagination,
    }
  }

  /**
   * Get specific `whatsNewPost` entry by `slug`.
   *
   * @param slug
   */
  public async getWhatsNewPost(slug: string): Promise<WhatsNewPost> {
    const filter = { slug }

    const getWhatsNewPostQuery = gql`
      query PostWithSlug($condition: WhatsNewPostFilter!) {
        whatsNewPostCollection(limit: 1, where: $condition) {
          items {
            title
            slug
            summary
            date
            body {
              json
            }
          }
        }
      }
    `

    const { items } = (
      await this.apolloClient.query({
        query: getWhatsNewPostQuery,
        variables: { condition: filter },
      })
    ).data.whatsNewPostCollection

    if (!items?.length) {
      throw new Error('Whats new post not found')
    }

    return items.map((post: WhatsNewPostApollo) => ({
      ...post,
      body: documentToHtmlString(post.body.json),
    }))[0]
  }

  /**
   * Get `outageBanner` entry.
   */
  public async getOutageBanner(activeCaseLoadId: string): Promise<string> {
    const filter = { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }

    const getOutageBannerQuery = gql`
      query OutageBanner($condition: OutageBannerFilter!) {
        outageBannerCollection(limit: 1, order: sys_publishedAt_DESC, where: $condition) {
          items {
            text {
              json
            }
            prisons
          }
        }
      }
    `

    const { items } = (
      await this.apolloClient.query({
        query: getOutageBannerQuery,
        variables: { condition: filter },
      })
    ).data.outageBannerCollection

    if (!items?.length) {
      return undefined
    }

    return items.map((outageBanner: OutageBannerApollo) => ({
      ...outageBanner,
      text: documentToHtmlString(outageBanner.text.json),
    }))[0]?.text
  }
}
