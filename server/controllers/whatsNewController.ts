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

      // Whats new Section - filter to active caseload if post has been marked for specific prisons
      const whatsNewPosts = (await this.contentfulService.getWhatsNewPosts()).filter(
        post => !post.prisons || post.prisons.includes(activeCaseLoadId),
      )

      res.render('pages/whatsNew', {
        pageTitle: "What's new",
        whatsNewPosts,
      })
    }
  }

  public displayWhatsNewPost(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { slug } = req.params

      // Whats new Section - filter to active caseload if post has been marked for specific prisons
      const whatsNewPost = await this.contentfulService.getWhatsNewPost(slug)

      res.render('pages/whatsNewPost', {
        pageTitle: whatsNewPost.title,
        whatsNewPost,
      })
    }
  }
}
