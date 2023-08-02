import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import HomepageService from '../services/homepageService'
import HmppsCache from '../middleware/hmppsCache'
import { userHasRoles } from '../utils/utils'
import ContentfulService from '../services/contentfulService'
import { getTasks } from '../data/dpsServicesDataStore'

/**
 * Parse requests for homepage routes and orchestrate response
 */
export default class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly todayCache: HmppsCache,
    private readonly contentfulService: ContentfulService,
  ) {}

  public displayHomepage(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { activeCaseLoadId } = res.locals.user

      // Search Section
      const errors = req.flash('errors')
      const userHasGlobal = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
      const searchViewAllUrl = `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${activeCaseLoadId}`

      // Today Section - wrapped with a caching function per prison to reduce API calls
      const todayData = await this.todayCache.wrap(activeCaseLoadId, () =>
        this.homepageService.getTodaySection(res.locals.clientToken, activeCaseLoadId),
      )

      const servicesData = await this.getServices(req, res, next)

      const services = servicesData
        .filter(task => task.enabled)
        .map(task => ({
          id: task.id,
          href: task.href,
          heading: task.heading,
          description: task.description,
        }))
      // Whats new Section - filter to active caseload if post has been marked for specific prisons
      const whatsNewData = await this.contentfulService.getWhatsNewPosts(1, 3, 0, activeCaseLoadId)

      res.render('pages/index', {
        errors,
        userHasGlobal,
        searchViewAllUrl,
        services,
        globalPreset: !!errors?.length && userHasGlobal,
        ...todayData,
        whatsNewPosts: whatsNewData.whatsNewPosts,
      })
    }
  }

  public search(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { searchType, name, location } = req.body

      if (searchType === 'local') {
        return res.redirect(
          `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`,
        )
      }
      // Else 'global'
      if (!name?.trim()) {
        req.flash('errors', { text: 'Enter a prisoner’s name or prison number', href: '#name' })
        return res.redirect('/')
      }
      return res.redirect(`${config.serviceUrls.digitalPrisons}/global-search/results?searchText=${name}`)
    }
  }

  public async getServices(req: Request, res: Response, next: NextFunction) {
    const { whereaboutsMaintenanceMode } = config.app
    const { keyworkerMaintenanceMode } = config.app
    const { activeCaseLoadId } = res.locals.user

    let whereaboutsConfig
    if (whereaboutsMaintenanceMode) {
      whereaboutsConfig = { enabled: false }
    } else {
      whereaboutsConfig = await this.homepageService
        .getWhereaboutsConfig(res.locals.clientToken, activeCaseLoadId)
        ?.catch(() => null)
    }

    let keyworkerPrisonStatus
    if (keyworkerMaintenanceMode) {
      keyworkerPrisonStatus = { migrated: false } // this can be empty because we're using the feature flag in getTasks
    } else {
      keyworkerPrisonStatus = await this.homepageService
        .getPrisonMigrationStatus(res.locals.clientToken, activeCaseLoadId)
        ?.catch(() => null)
    }

    const allServices = getTasks(
      res.locals.user.activeCaseLoadId,
      res.locals.user.locations,
      res.locals.user.staffId,
      whereaboutsConfig,
      keyworkerPrisonStatus,
      res.locals.user.userRoles,
    )

    return allServices
  }
}
