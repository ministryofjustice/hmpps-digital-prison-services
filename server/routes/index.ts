import { RequestHandler, Router } from 'express'
import type { Services } from '../services'
import HomepageController from '../controllers/homepageController'
import whatsNewRouter from './whatsNewRouter'
import managedPageRouter from './managedPageRouter'
import dietaryRequirementsRouter from './dietaryRequirementsRouter'
import config from '../config'
import SearchController from '../controllers/searchController'
import CommonApiRoutes from './common/api'
import { userHasRoles } from '../utils/utils'

export default function routes(services: Services): Router {
  const router = Router()
  const commonApiRoutes = new CommonApiRoutes(services.dataAccess.prisonApiClientBuilder)

  const homepageController = new HomepageController(
    services.contentfulService,
    services.establishmentRollService,
    services.serviceData,
    services.whatsNewCache,
    services.outageBannerCache,
  )

  const searchController = new SearchController(
    services.prisonerSearchService,
    services.globalSearchService,
    services.metricsService,
  )

  const ensureGlobalSearchUser: RequestHandler = (_req, res, next) => {
    const {
      user: { userRoles },
    } = res.locals
    if (userHasRoles(['GLOBAL_SEARCH'], userRoles)) {
      return next()
    }
    return res.render('notFound', { url: '/' })
  }

  // API routes
  if (config.features.prisonerSearchEnabled) {
    router.get('/api/prisoner/:prisonerNumber/image/data', commonApiRoutes.prisonerImage)
  }

  // Page routes
  router.get('/', homepageController.displayHomepage())
  router.post('/search', homepageController.search())
  router.use(managedPageRouter(services))
  router.use('/whats-new', whatsNewRouter(services))
  router.use('/dietary-requirements', dietaryRequirementsRouter(services))

  if (config.features.prisonerSearchEnabled) {
    router.get('/prisoner-search', searchController.localSearch().get())
    router.post('/prisoner-search', searchController.localSearch().post())
    router.get('/global-search', ensureGlobalSearchUser, searchController.globalSearch().get())
    router.get('/global-search/results', ensureGlobalSearchUser, searchController.globalSearch().results.get())
  }

  // Redirect routes
  router.get('/establishment-roll{*path}', (_req, res) => {
    res.render('pages/establishmentRollHasMoved', { establishmentRollUrl: config.apis.establishmentRoll.ui_url })
  })

  return router
}
