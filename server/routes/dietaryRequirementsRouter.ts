import { RequestHandler, Router } from 'express'
import { Services } from '../services'
import DietaryRequirementsController from '../controllers/dietaryRequirementsController'

export default function dietaryRequirementsRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => handler),
    )

  const dietaryRequirementsController = new DietaryRequirementsController(
    services.dietReportingService,
    services.pdfRenderingService,
    services.auditService,
  )

  get('/', dietaryRequirementsController.get())
  get('/print-all', dietaryRequirementsController.printAll())

  return router
}
