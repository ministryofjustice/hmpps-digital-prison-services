import { Request, RequestHandler, Response } from 'express'
import EstablishmentRollService from '../services/establishmentRollService'

export default class EstablishmentRollController {
  constructor(private readonly establishmentRollService: EstablishmentRollService) {}

  public getEstablishmentRoll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const establishmentRollCounts = await this.establishmentRollService.getEstablishmentRollCounts(
        clientToken,
        user.activeCaseLoadId,
      )

      res.render('pages/establishmentRoll', { establishmentRollCounts, date: new Date() })
    }
  }
}
