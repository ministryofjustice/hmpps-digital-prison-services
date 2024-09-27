import { Request, RequestHandler, Response } from 'express'
import EstablishmentRollService from '../services/establishmentRollService'
import MovementsService from '../services/movementsService'
import { userHasRoles } from '../utils/utils'
import { Role } from '../enums/role'
import LocationService from '../services/locationsService'
import { Service } from '../data/interfaces/component'
import ServiceData from './ServiceData'

export default class EstablishmentRollController {
  constructor(
    private readonly establishmentRollService: EstablishmentRollService,
    private readonly movementsService: MovementsService,
    private readonly locationService: LocationService,
    private readonly serviceData: ServiceData,
  ) {}

  private isResidentialLocationsEnabledForThisPrison(services: {
    showServicesOutage: boolean
    services: Service[]
  }): boolean {
    const resService = services.services.filter(service => service.id === 'residential-locations')
    return resService !== undefined && resService.length > 0 && resService[0].navEnabled
  }

  public getEstablishmentRoll(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware

      const useLocationsApi = this.isResidentialLocationsEnabledForThisPrison(
        await this.serviceData.getServiceData(res),
      )

      const establishmentRollCounts = await this.establishmentRollService.getEstablishmentRollCounts(
        clientToken,
        user.activeCaseLoadId,
        useLocationsApi,
      )

      res.render('pages/establishmentRoll', {
        establishmentRollCounts,
        date: new Date(),
        useWorkingCapacity: useLocationsApi,
      })
    }
  }

  public getEstablishmentRollForLanding(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { user } = res.locals
      const { clientToken } = req.middleware
      const { landingId, wingId } = req.params

      const useLocationsApi = this.isResidentialLocationsEnabledForThisPrison(
        await this.serviceData.getServiceData(res),
      )
      const rollCounts = await this.establishmentRollService.getLandingRollCounts(
        clientToken,
        user.activeCaseLoadId,
        wingId,
        landingId,
        useLocationsApi,
      )

      res.render('pages/establishmentRollLanding', rollCounts)
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

      const useLocationsApi = this.isResidentialLocationsEnabledForThisPrison(
        await this.serviceData.getServiceData(res),
      )

      if (useLocationsApi) {
        const [prisonersCurrentlyOut, location] = await Promise.all([
          this.movementsService.getOffendersCurrentlyOutOfBed(clientToken, livingUnitId),
          this.locationService.getInternalLocationInfo(clientToken, livingUnitId),
        ])

        res.render('pages/currentlyOut', {
          prisoners: prisonersCurrentlyOut,
          locationName: location.localName ? location.localName : location.pathHierarchy,
        })
      } else {
        const [prisonersCurrentlyOut, location] = await Promise.all([
          this.movementsService.getOffendersCurrentlyOutOfLivingUnit(clientToken, livingUnitId),
          this.locationService.getLocationInfo(clientToken, livingUnitId),
        ])

        res.render('pages/currentlyOut', {
          prisoners: prisonersCurrentlyOut,
          locationName: location.userDescription ? location.userDescription : location.description,
        })
      }
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
        locationName: null,
      })
    }
  }
}
