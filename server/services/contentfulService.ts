import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { ApolloClient, gql } from '@apollo/client/core'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { WhatsNewData } from '../data/interfaces/whatsNewData'
import { WhatsNewPost, WhatsNewPostApollo } from '../data/interfaces/whatsNewPost'
import { OutageBannerApollo } from '../data/interfaces/outageBanner'
import { ManagedPage, ManagedPageApollo } from '../data/interfaces/managedPage'

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
    activeCaseLoadId: string | undefined,
  ): Promise<WhatsNewData> {
    const filter = activeCaseLoadId
      ? { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }
      : { prisons_exists: false }

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
              links {
                assets {
                  hyperlink {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    description
                    fileName
                  }
                  block {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    width
                    height
                    description
                  }
                }
              }
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
      body: documentToHtmlString(post.body.json, this.renderOptions(post.body.links)),
    }))[0]
  }

  /**
   * Get `outageBanner` entry.
   */
  public async getOutageBanner(activeCaseLoadId: string | undefined): Promise<string> {
    const filter = activeCaseLoadId
      ? { OR: [{ prisons_exists: false }, { prisons_contains_some: activeCaseLoadId }] }
      : { prisons_exists: false }

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

  /**
   * Get `managedPage` by `slug`.
   */
  public async getManagedPage(slug: string): Promise<ManagedPage> {
    const filter = { slug }

    const getManagedPageBySlugQuery = gql`
      query ManagedPageBySlug($condition: ManagedPageFilter!) {
        managedPageCollection(limit: 1, where: $condition) {
          items {
            title
            slug
            content {
              json
              links {
                assets {
                  hyperlink {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    description
                    fileName
                  }
                  block {
                    sys {
                      id
                    }
                    contentType
                    url
                    title
                    width
                    height
                    description
                  }
                }
              }
            }
          }
        }
      }
    `

    const { items } = (
      await this.apolloClient.query({
        query: getManagedPageBySlugQuery,
        variables: { condition: filter },
      })
    ).data.managedPageCollection

    if (!items?.length) {
      throw new Error('Page not found')
    }

    return items.map((page: ManagedPageApollo) => ({
      ...page,
      content: documentToHtmlString(page.content.json, this.renderOptions(page.content.links)),
    }))[0]
  }

  private renderOptions(links: any) {
    const hyperlinkMap: Map<any, any> = new Map(
      links?.assets?.hyperlink?.map((hyperlink: any) => [hyperlink.sys.id, hyperlink]),
    )
    const blockMap: Map<any, any> = new Map(links?.assets?.block?.map((block: any) => [block.sys.id, block]))

    return {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
          // find the asset in the assetMap by ID
          const asset = blockMap?.get(node.data.target.sys.id)

          // render the asset based on contentType
          if (asset.contentType.startsWith('image')) {
            return `<img src="${asset.url}" alt="${asset.description}" />`
          }

          if (asset.contentType.startsWith('video')) {
            return `<video controls aria-description="${asset.description}">
                      <source src="${asset.url}" type="${asset.contentType}">
                      <a href="${asset.url}" class="govuk-link">Download video - ${asset.title}</a>
                    </video>`
          }

          return ''
        },
        [INLINES.ASSET_HYPERLINK]: (node: any) => {
          // find the asset in the assetMap by ID
          const asset = hyperlinkMap?.get(node.data.target.sys.id)

          return `<a href="${asset.url}" aria-description="${asset.description}" class="govuk-link">${asset.title}</a>`
        },
      },
    }
  }
}
