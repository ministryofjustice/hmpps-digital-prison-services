import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import ImageController from '../controllers/imageController'
import { dataAccess } from '../data'

export default function apiRouter(): Router {
  const router = Router()
  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const imageController = new ImageController(dataAccess.prisonApiClientBuilder)

  get('/prisonerImage/:prisonerNumber', imageController.prisonerImage)

  return router
}
