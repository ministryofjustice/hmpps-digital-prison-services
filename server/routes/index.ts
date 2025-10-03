import { Router } from 'express'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import managedPageRouter from './managedPageRouter'
import dietaryRequirementsRouter from './dietaryRequirementsRouter'
import config from '../config'

export default function routes(services: Services): Router {
  const router = Router()

  const homepageController = new HomepageController(
    services.contentfulService,
    services.establishmentRollService,
    services.serviceData,
  )

  router.get('/', homepageController.displayHomepage())
  router.post('/search', homepageController.search())
  router.use(managedPageRouter(services))
  router.use('/whats-new', whatsNewRouter(services))
  router.use('/dietary-requirements', dietaryRequirementsRouter(services))
  router.get('/establishment-roll{*path}', (_req, res) => {
    res.render('pages/establishmentRollHasMoved', { establishmentRollUrl: config.apis.establishmentRoll.ui_url })
  })

  return router
}
