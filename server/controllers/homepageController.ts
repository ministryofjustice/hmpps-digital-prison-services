import { NextFunction, Request, RequestHandler, Response } from 'express'
import { userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import config from '../config'
import HomepageService from '../services/homepageService'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  public displayHomepage(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { userRoles, activeCaseLoadId } = res.locals.user

      // Search Section
      const errors = req.flash('errors')
      const userHasGlobal = userHasRoles([Role.GlobalSearch], userRoles)
      const searchViewAllUrl = `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${activeCaseLoadId}`

      // Today Section
      const todayData = await this.homepageService.getTodaySection(res.locals.clientToken, activeCaseLoadId)

      res.render('pages/index', {
        errors,
        userHasGlobal,
        searchViewAllUrl,
        globalPreset: !!errors?.length && userHasGlobal,
        ...todayData,
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
