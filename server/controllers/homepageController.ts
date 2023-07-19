import { NextFunction, Request, RequestHandler, Response } from 'express'
import { userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import config from '../config'

/**
 * Parse requests for case notes routes and orchestrate response
 */
export default class HomepageController {
  public displayHomepage(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const errors = req.flash('errors')
      const userHasGlobal = userHasRoles([Role.GlobalSearch], res.locals.user.userRoles)
      const searchViewAllUrl = `${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=&location=${res.locals.user.activeCaseLoadId}`

      res.render('pages/index', {
        errors,
        userHasGlobal,
        globalPreset: !!errors?.length && userHasGlobal,
        searchViewAllUrl,
      })
    }
  }

  public search(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { searchType, name, location } = req.body
      if (searchType === 'global') {
        if (!name?.trim()) {
          req.flash('errors', { text: 'Enter a prisoner’s name or prison number', href: '#name' })
          return res.redirect('/')
        }
        return res.redirect(`${config.serviceUrls.digitalPrisons}/global-search/results?searchText=${name}`)
      }
      return res.redirect(`${config.serviceUrls.digitalPrisons}/prisoner-search?keywords=${name}&location=${location}`)
    }
  }
}
