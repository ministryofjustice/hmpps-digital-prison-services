import { Request, RequestHandler, Response } from 'express'
import EstablishmentRollService from '../services/establishmentRollService'
import MovementsService from '../services/movementsService'
import { userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import LocationService from '../services/locationsService'

export default class EstablishmentRollController {
  constructor(
    private readonly establishmentRollService: EstablishmentRollService,
    private readonly movementsService: MovementsService,
    private readonly locationService: LocationService,
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
        this.locationService.getLocationInfo(clientToken, wingId),
        spurId ? this.locationService.getLocationInfo(clientToken, spurId) : null,
        this.locationService.getLocationInfo(clientToken, landingId),
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

  public getUnallocated(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const unallocatedPrisoners = await this.movementsService.getNoCellAllocatedPrisoners(
        clientToken,
        user.activeCaseLoadId,
      )

      res.render('pages/noCellAllocated', {
        prisoners: unallocatedPrisoners,
        userCanAllocateCell: userHasRoles([Role.CellMove], user.userRoles),
      })
    }
  }

  public getCurrentlyOut(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { livingUnitId } = req.params
      const { clientToken } = req.middleware

      const [prisonersCurrentlyOut, location] = await Promise.all([
        this.movementsService.getOffendersCurrentlyOutOfLivingUnit(clientToken, livingUnitId),
        this.locationService.getLocationInfo(clientToken, livingUnitId),
      ])

      res.render('pages/currentlyOut', {
        prisoners: prisonersCurrentlyOut,
        location,
      })
    }
  }

  public getTotalCurrentlyOut(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const prisonersCurrentlyOut = await this.movementsService.getOffendersCurrentlyOutTotal(
        clientToken,
        user.activeCaseLoadId,
      )

      res.render('pages/currentlyOut', {
        prisoners: prisonersCurrentlyOut,
        location: null,
      })
    }
  }
}
