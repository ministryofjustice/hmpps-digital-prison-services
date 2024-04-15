import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import HomepageService from '../services/homepageService'
import HmppsCache from '../middleware/hmppsCache'
import { userHasRoles } from '../utils/utils'
import ContentfulService from '../services/contentfulService'
import ApiController from './apiController'
import { Service } from '../data/interfaces/component'

/**
 * Parse requests for homepage routes and orchestrate response
 */
export default class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly todayCache: HmppsCache,
    private readonly contentfulService: ContentfulService,
  ) {}

  private async getServiceData(req: Request, res: Response): Promise<Service[]> {
    if (res.locals.feComponentsMeta?.services) return res.locals.feComponentsMeta.services

    const apiController = new ApiController(this.homepageService)
    const servicesData = await apiController.getDpsServices(req, res)
    return servicesData
      .filter(task => task.enabled())
      .map(task => ({
        id: task.id,
        href: task.href,
        heading: task.heading,
        description: task.description,
      }))
  }

  public displayHomepage(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { activeCaseLoadId } = res.locals.user
      const userHasPrisonCaseLoad =
        Boolean(activeCaseLoadId) && activeCaseLoadId !== '' && activeCaseLoadId !== 'CADM_I'

      // Outage Banner - filtered to active caseload if banner has been marked for specific prisons
      const outageBanner = await this.contentfulService.getOutageBanner(activeCaseLoadId)

      // Search Section
      const errors = req.flash('errors')

      const userHasGlobal = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
      const searchViewAllUrl = activeCaseLoadId
        ? `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${activeCaseLoadId}`
        : ''

      // Today Section - wrapped with a caching function per prison to reduce API calls
      let todayData = {}
      if (userHasPrisonCaseLoad) {
        todayData = await this.todayCache.wrap(activeCaseLoadId, () =>
          this.homepageService.getTodaySection(req.middleware.clientToken, activeCaseLoadId),
        )
      }

      const services = await this.getServiceData(req, res)

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
        userHasPrisonCaseLoad,
      })
    }
  }

  public search(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { searchType, name, location } = req.body

      if (searchType === undefined || searchType === 'local') {
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
