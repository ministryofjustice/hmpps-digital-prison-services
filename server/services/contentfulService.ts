import * as contentful from 'contentful'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer'
import { Document } from '@contentful/rich-text-types'
import config from '../config'
import { WhatsNewPost } from '../data/interfaces/whatsNewPost'

export default class ContentfulService {
  contentfulApiClient: contentful.ContentfulClientApi<undefined>

  constructor() {
    this.contentfulApiClient = contentful.createClient({
      host: config.contentful.host,
      insecure: !!config.contentful.host,
      basePath: config.contentful.host ? '/contentful' : '',
      space: config.contentful.spaceId,
      accessToken: config.contentful.accessToken,
    })
  }

  /**
   * Get list of `whatsNewPost` entries.
   *
   * Ordered by `date` descending (latest first)
   *
   * @param options
   */
  public async getWhatsNewPosts(options?: { limit: number }): Promise<WhatsNewPost[]> {
    const entries = await this.contentfulApiClient.getEntries({
      content_type: 'whatsNewPost',
      order: ['-fields.date'],
      limit: options?.limit,
    })

    if (!entries.items?.length) {
      return []
    }
    return entries.items.map(
      ({ fields }) =>
        <WhatsNewPost>{
          title: fields.title,
          summary: fields.summary,
          slug: fields.slug,
          body: documentToHtmlString(fields.body as Document),
          date: fields.date,
          prisons: fields.prisons,
        },
    )
  }
}
