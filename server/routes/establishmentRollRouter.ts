import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import getFrontendComponents from '../middleware/frontEndComponents'
import config from '../config'
import EstablishmentRollController from '../controllers/establishmentRollController'

export default function establishmentRollRouter(services: Services): Router {
  const router = Router()
  router.get('*', getFrontendComponents(services, config.apis.frontendComponents.latest))

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const establishmentRollController = new EstablishmentRollController(services.establishmentRollService)

  get('/', establishmentRollController.getEstablishmentRoll())

  get(
    ['/wing/:wingId/landing/:landingId', '/wing/:wingId/spur/:spurId/landing/:landingId'],
    establishmentRollController.getEstablishmentRollForLanding(),
  )

  return router
}
