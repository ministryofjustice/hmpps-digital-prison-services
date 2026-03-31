import { Request, RequestHandler, Response } from 'express'
import logger from '../../logger'
import { UserService } from '../services'
import { isSafeForRedirect } from '../utils/isSafeForRedirect'

export default class ChangeCaseloadController {
  constructor(private readonly userService: UserService) {}

  public get(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { caseLoads },
      } = res.locals

      if (caseLoads.length <= 1) {
        return res.redirect('/')
      }

      const options = caseLoads.map(caseload => ({
        value: caseload.caseLoadId,
        text: caseload.description,
      }))

      const backUrl: string | undefined = [req.query?.backUrl, req.get('referrer')]
        .filter(url => typeof url === 'string')
        .filter(isSafeForRedirect)
        .find(url => !new URL(url).pathname.match(/\/change-caseload\/?/))

      return res.render('pages/changeCaseload/changeCaseload', {
        options,
        backUrl,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { caseLoadId }: { caseLoadId: string | undefined } = req.body
      const {
        user: { token, caseLoads },
      } = res.locals

      const caseloadToSet = caseLoads.find(caseload => caseload.caseLoadId === caseLoadId)

      if (!req.body.caseLoadId || !caseloadToSet) {
        res.status(400)
        logger.error(req.originalUrl, 'Caseload ID is missing, not assigned to user, or does not exist')
        return res.render('pages/changeCaseload/error.njk', {
          url: '/change-caseload',
        })
      }

      await this.userService.setActiveCaseload(token, caseloadToSet)
      return res.redirect('/')
    }
  }
}
