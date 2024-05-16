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

  public getOutToday(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const prisonersOutToday = await this.movementsService.getOutTodayPrisoners(clientToken, user.activeCaseLoadId)

      res.render('pages/outToday', { prisoners: prisonersOutToday })
    }
  }

  public getEnRoute(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const prisonersEnRoute = await this.movementsService.getEnRoutePrisoners(clientToken, user.activeCaseLoadId)

      res.render('pages/enRoute', { prisoners: prisonersEnRoute, prison: user.activeCaseLoad.description })
    }
  }

  public getInReception(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const prisonersEnRoute = await this.movementsService.getInReceptionPrisoners(clientToken, user.activeCaseLoadId)

      res.render('pages/inReception', { prisoners: prisonersEnRoute, prison: user.activeCaseLoad.description })
    }
  }
}
