import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagedPageController from '../controllers/managedPageController'

export default function whatsNewRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const managedPageController = new ManagedPageController(services.contentfulService)

  get('/accessibility-statement', managedPageController.displayManagedPage('accessibility-statement'))
  get('/privacy-policy', managedPageController.displayManagedPage('privacy-policy'))
  get('/terms-and-conditions', managedPageController.displayManagedPage('terms-and-conditions'))
  get('/cookies-policy', managedPageController.displayManagedPage('cookies-policy'))

  router.use('/learn-more-about-dps', managedPageController.displayManagedPage('learn-more-about-dps'))

  return router
}
