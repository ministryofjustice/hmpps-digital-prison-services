import { Request, RequestHandler, Response } from 'express'
import EstablishmentRollService from '../services/establishmentRollService'
import MovementsService from '../services/movementsService'

export default class EstablishmentRollController {
  constructor(
    private readonly establishmentRollService: EstablishmentRollService,
    private readonly movementsService: MovementsService,
  ) {}

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

  public getEstablishmentRollForLanding(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware
      const { landingId, wingId, spurId } = req.params

      const [landingRollCounts, wing, spur, landing] = await Promise.all([
        this.establishmentRollService.getLandingRollCounts(clientToken, user.activeCaseLoadId, Number(landingId)),
        this.establishmentRollService.getLocationInfo(clientToken, wingId),
        spurId ? this.establishmentRollService.getLocationInfo(clientToken, spurId) : null,
        this.establishmentRollService.getLocationInfo(clientToken, landingId),
      ])

      res.render('pages/establishmentRollLanding', { landingRollCounts, wing, spur, landing })
    }
  }

  public getArrivedToday(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const arrivedPrisoners = await this.movementsService.getArrivedTodayPrisoners(clientToken, user.activeCaseLoadId)

      res.render('pages/arrivingToday', { prisoners: arrivedPrisoners })
    }
  }
}
