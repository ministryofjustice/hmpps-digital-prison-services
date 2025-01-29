import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import DietaryRequirementsController from '../controllers/dietaryRequirementsController'

export default function dietaryRequirementsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const dietaryRequirementsController = new DietaryRequirementsController(services.dietReportingService)

  get('/', dietaryRequirementsController.get())
  get('/print-all', dietaryRequirementsController.printAll())

  return router
}
