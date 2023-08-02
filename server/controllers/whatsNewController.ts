import { NextFunction, Request, RequestHandler, Response } from 'express'
import ContentfulService from '../services/contentfulService'

/**
 * Parse requests for whats new routes and orchestrate response
 */
export default class WhatsNewController {
  constructor(private readonly contentfulService: ContentfulService) {}

  public displayWhatsNewList(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { activeCaseLoadId } = res.locals.user
      const pageSize = 10
      const currentPage = +req.query.page || 1
      const skip = (currentPage - 1) * pageSize

      const whatsNewData = await this.contentfulService.getWhatsNewPosts(currentPage, pageSize, skip, activeCaseLoadId)

      res.render('pages/whatsNew', {
        pageTitle: "What's new",
        ...whatsNewData,
      })
    }
  }

  public displayWhatsNewPost(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { slug } = req.params

      try {
        const whatsNewPost = await this.contentfulService.getWhatsNewPost(slug)

        res.render('pages/whatsNewPost', {
          pageTitle: whatsNewPost.title,
          whatsNewPost,
        })
      } catch (error) {
        res.render('notFound')
      }
    }
  }
}
