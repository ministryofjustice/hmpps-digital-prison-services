import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import ApiController from '../controllers/apiController'
import getFrontendComponents from '../middleware/frontEndComponents'
import managedPageRouter from './managedPageRouter'
import config from '../config'
import EstablishmentRollController from '../controllers/establishmentRollController'

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
  const establishmentRollController = new EstablishmentRollController(services.establishmentRollService)
  const apiController = new ApiController(services.homepageService)

  get('/', getFrontendComponents(services, config.apis.frontendComponents.latest), homepageController.displayHomepage())
  post('/search', homepageController.search())
  get(
    '/establishment-roll',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    establishmentRollController.getEstablishmentRoll(),
  )

  router.use(managedPageRouter(services))

  get('/api/dps-services', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    const dpsServices = await apiController.getDpsServices(req, res)
    res.end(JSON.stringify(dpsServices))
  })

  router.use(
    '/whats-new',
    getFrontendComponents(services, config.apis.frontendComponents.latest),
    whatsNewRouter(services),
  )

  return router
}
