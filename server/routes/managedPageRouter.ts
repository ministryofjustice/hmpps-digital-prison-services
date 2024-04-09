import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ManagedPageController from '../controllers/managedPageController'
import getFrontendComponents from '../middleware/frontEndComponents'
import config from '../config'

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
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('accessibility-statement'),
  )
  get(
    '/privacy-policy',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('privacy-policy'),
  )
  get(
    '/terms-and-conditions',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('terms-and-conditions'),
  )
  get(
    '/cookies-policy',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('cookies-policy'),
  )
  get(
    '/test',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('test'),
  )

  router.use(
    '/learn-more-about-dps',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    managedPageController.displayManagedPage('learn-more-about-dps'),
  )

  return router
}
