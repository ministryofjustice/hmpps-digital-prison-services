import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import HomepageService from '../services/homepageService'
import HmppsCache from '../middleware/hmppsCache'
import { userHasRoles } from '../utils/utils'
import ContentfulService from '../services/contentfulService'
import ApiController from './apiController'

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

      // Outage Banner - filtered to active caseload if banner has been marked for specific prisons
      const outageBanner = await this.contentfulService.getOutageBanner(activeCaseLoadId)

      // Search Section
      const errors = req.flash('errors')

      const userHasGlobal = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
      const searchViewAllUrl = `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${activeCaseLoadId}`

      // Today Section - wrapped with a caching function per prison to reduce API calls
      const todayData = await this.todayCache.wrap(activeCaseLoadId, () =>
        this.homepageService.getTodaySection(res.locals.clientToken, activeCaseLoadId),
      )

      const apiController = new ApiController(this.homepageService)

      const servicesData = await apiController.getDpsServices(res)

      const services = servicesData
        .filter(task => task.enabled())
        .map(task => ({
          id: task.id,
          href: task.href,
          heading: task.heading,
          description: task.description,
        }))
      // Whats new Section - filtered to active caseload if post has been marked for specific prisons
      const whatsNewData = await this.contentfulService.getWhatsNewPosts(1, 3, 0, activeCaseLoadId)

      res.render('pages/index', {
        errors,
        userHasGlobal,
        searchViewAllUrl,
        services,
        globalPreset: !!errors?.length && userHasGlobal,
        ...todayData,
        whatsNewPosts: whatsNewData.whatsNewPosts,
        outageBanner,
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
}
