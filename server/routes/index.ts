import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import managedPageRouter from './managedPageRouter'
import establishmentRollRouter from './establishmentRollRouter'
import apiRouter from './apiRouter'

export default function routes(services: Services): Router {
  const router = Router()
  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )
  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const homepageController = new HomepageController(
    services.homepageService,
    services.todayCache,
    services.contentfulService,
  )

  get('/', homepageController.displayHomepage())
  post('/search', homepageController.search())
  router.use(managedPageRouter(services))
  router.use('/establishment-roll', establishmentRollRouter(services))
  router.use('/whats-new', whatsNewRouter(services))
  router.use('/api', apiRouter())

  return router
}
