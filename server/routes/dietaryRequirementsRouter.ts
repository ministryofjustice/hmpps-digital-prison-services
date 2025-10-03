import { Router } from 'express'
import { Services } from '../services'
import DietaryRequirementsController from '../controllers/dietaryRequirementsController'

export default function dietaryRequirementsRouter(services: Services): Router {
  const router = Router()

  const dietaryRequirementsController = new DietaryRequirementsController(
    services.dietReportingService,
    services.pdfRenderingService,
    services.auditService,
  )

  router.get('/', dietaryRequirementsController.get())
  router.get('/print-all', dietaryRequirementsController.printAll())

  return router
}
