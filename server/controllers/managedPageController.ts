import { RequestHandler } from 'express'
import ContentfulService from '../services/contentfulService'

/**
 * Parse requests for managed page routes and orchestrate response
 */
export default class ManagedPageController {
  constructor(private readonly contentfulService: ContentfulService) {}

  public displayManagedPage(slug: string): RequestHandler {
    return async (_req, res) => {
      try {
        const managedPage = await this.contentfulService.getManagedPage(slug)

        res.render('pages/managedPage', {
          pageTitle: managedPage.title,
          managedPage,
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        res.render('notFound')
      }
    }
  }
}
