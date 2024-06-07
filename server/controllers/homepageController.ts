import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import HomepageService from '../services/homepageService'
import HmppsCache from '../middleware/hmppsCache'
import { userHasRoles } from '../utils/utils'
import ContentfulService from '../services/contentfulService'
import { Service } from '../data/interfaces/component'
import defaultServices from '../utils/defaultServices'

/**
 * Parse requests for homepage routes and orchestrate response
 */
export default class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
    private readonly todayCache: HmppsCache,
    private readonly contentfulService: ContentfulService,
  ) {}

  private async getServiceData(res: Response): Promise<{ showServicesOutage: boolean; services: Service[] }> {
    if (res.locals.feComponentsMeta?.services)
      return { showServicesOutage: false, services: res.locals.feComponentsMeta.services }

    return { showServicesOutage: true, services: defaultServices }
  }

  private async getTodayData(req: Request, userHasPrisonCaseLoad: boolean, activeCaseLoadId: string) {
    if (userHasPrisonCaseLoad) {
      return this.todayCache.wrap(activeCaseLoadId, () =>
        this.homepageService.getTodaySection(req.middleware.clientToken, activeCaseLoadId),
      )
    }

    return {}
  }

  public displayHomepage(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { activeCaseLoadId } = res.locals.user
      const userHasPrisonCaseLoad =
        Boolean(activeCaseLoadId) && activeCaseLoadId !== '' && activeCaseLoadId !== 'CADM_I'

      // Search Section
      const errors = req.flash('errors')

      const userHasGlobal = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
      const searchViewAllUrl = activeCaseLoadId
        ? `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${activeCaseLoadId}`
        : ''

      // Today Section - wrapped with a caching function per prison to reduce API calls

      // Outage Banner - filtered to active caseload if banner has been marked for specific prisons
      // Whats new Section - filtered to active caseload if post has been marked for specific prisons
      const [outageBanner, { showServicesOutage, services }, whatsNewData, todayData] = await Promise.all([
        this.contentfulService.getOutageBanner(activeCaseLoadId),
        this.getServiceData(res),
        this.contentfulService.getWhatsNewPosts(1, 3, 0, activeCaseLoadId),
        this.getTodayData(req, userHasPrisonCaseLoad, activeCaseLoadId),
      ])

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
        showServicesOutage,
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
