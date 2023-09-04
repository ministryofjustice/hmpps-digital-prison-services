import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagedPageController from '../controllers/managedPageController'
import getFrontendComponents from '../middleware/frontEndComponents'

export default function whatsNewRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const managedPageController = new ManagedPageController(services.contentfulService)

  get(
    '/accessibility-statement',
    getFrontendComponents(services),
    managedPageController.displayManagedPage('accessibility-statement'),
  )
  get('/privacy-policy', getFrontendComponents(services), managedPageController.displayManagedPage('privacy-policy'))
  get(
    '/terms-and-conditions',
    getFrontendComponents(services),
    managedPageController.displayManagedPage('terms-and-conditions'),
  )
  get('/cookies-policy', getFrontendComponents(services), managedPageController.displayManagedPage('cookies-policy'))

  return router
}
