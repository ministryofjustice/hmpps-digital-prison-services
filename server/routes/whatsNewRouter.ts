import { Router } from 'express'
import { Services } from '../services'
import WhatsNewController from '../controllers/whatsNewController'

export default function whatsNewRouter(services: Services): Router {
  const router = Router()

  const whatsNewController = new WhatsNewController(services.contentfulService)

  router.get('/', whatsNewController.displayWhatsNewList())
  router.get('/:slug', whatsNewController.displayWhatsNewPost())

  return router
}
