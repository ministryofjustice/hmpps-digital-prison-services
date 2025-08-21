import { NextFunction, Request, RequestHandler, Response } from 'express'
import { Role } from '../enums/role'
import config from '../config'
import { userHasRoles } from '../utils/utils'
import ContentfulService from '../services/contentfulService'
import EstablishmentRollService from '../services/establishmentRollService'
import ServiceData from './ServiceData'

/**
 * Parse requests for homepage routes and orchestrate response
 */
export default class HomepageController {
  constructor(
    private readonly contentfulService: ContentfulService,
    private readonly establishmentRollService: EstablishmentRollService,
    private readonly serviceData: ServiceData,
  ) {}

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

      // Outage Banner - filtered to active caseload if banner has been marked for specific prisons
      // Whats new Section - filtered to active caseload if post has been marked for specific prisons
      const [outageBanner, { showServicesOutage, services }, whatsNewData, todayData] = await Promise.all([
        this.contentfulService.getOutageBanner(activeCaseLoadId),
        this.serviceData.getServiceData(res),
        this.contentfulService.getWhatsNewPosts(1, 3, 0, activeCaseLoadId),
        userHasPrisonCaseLoad
          ? this.establishmentRollService.getEstablishmentRollSummary(req.middleware.clientToken, activeCaseLoadId)
          : {},
      ])

      res.render('pages/index', {
        errors,
        userHasGlobal,
        searchViewAllUrl,
        services,
        globalPreset: !!errors?.length && userHasGlobal,
        todayData,
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
