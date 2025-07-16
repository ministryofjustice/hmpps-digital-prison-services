import { NextFunction, Request, RequestHandler, Response } from 'express'
import ContentfulService from '../services/contentfulService'

/**
 * Parse requests for managed page routes and orchestrate response
 */
export default class ManagedPageController {
  constructor(private readonly contentfulService: ContentfulService) {}

  public displayManagedPage(slug: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const managedPage = await this.contentfulService.getManagedPage(slug)

        res.render('pages/managedPage', {
          pageTitle: managedPage.title,
          managedPage,
        })
      } catch (_error) {
        res.render('notFound')
      }
    }
  }
}
