import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import managedPageRouter from './managedPageRouter'
import dietaryRequirementsRouter from './dietaryRequirementsRouter'
import config from '../config'

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
    services.contentfulService,
    services.establishmentRollService,
    services.serviceData,
  )

  get('/', homepageController.displayHomepage())
  post('/search', homepageController.search())
  router.use(managedPageRouter(services))
  router.use('/whats-new', whatsNewRouter(services))
  router.use('/dietary-requirements', dietaryRequirementsRouter(services))
  router.get(
    '/establishment-roll*',
    asyncMiddleware(async (req, res) => {
      res.render('pages/establishmentRollHasMoved', { establishmentRollUrl: config.apis.establishmentRoll.ui_url })
    }),
  )

  return router
}
