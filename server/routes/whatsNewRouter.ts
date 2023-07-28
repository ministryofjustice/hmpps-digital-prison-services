import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import WhatsNewController from '../controllers/whatsNewController'

export default function whatsNewRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const whatsNewController = new WhatsNewController(services.contentfulService)

  get('/whats-new', whatsNewController.displayWhatsNewList())
  get('/whats-new/:slug', whatsNewController.displayWhatsNewPost())

  return router
}
