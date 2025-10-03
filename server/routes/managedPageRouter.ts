import { Router } from 'express'
import { Services } from '../services'
import ManagedPageController from '../controllers/managedPageController'

export default function whatsNewRouter(services: Services): Router {
  const router = Router()

  const managedPageController = new ManagedPageController(services.contentfulService)

  router.get('/accessibility-statement', managedPageController.displayManagedPage('accessibility-statement'))
  router.get('/privacy-policy', managedPageController.displayManagedPage('privacy-policy'))
  router.get('/terms-and-conditions', managedPageController.displayManagedPage('terms-and-conditions'))
  router.get('/cookies-policy', managedPageController.displayManagedPage('cookies-policy'))

  router.use('/learn-more-about-dps', managedPageController.displayManagedPage('learn-more-about-dps'))

  return router
}
