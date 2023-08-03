import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import ApiController from '../controllers/apiController'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const apiController = new ApiController(services.homepageService)

  get('/', homepageController.displayHomepage())
  post('/search', homepageController.search())

  get('/api/dps-services', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json')
    const dpsServices = await apiController.getServices(res)
    res.end(JSON.stringify(dpsServices))
  })

  router.use(whatsNewRouter(services))

  return router
}
