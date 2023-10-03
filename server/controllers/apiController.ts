import { Response } from 'express'
import config from '../config'
import HomepageService from '../services/homepageService'
import { getTasks } from '../data/dpsServicesDataStore'

/**
 * Parse requests for API routes and orchestrate response
 */
export default class ApiController {
  constructor(private readonly homepageService: HomepageService) {}

  public async getDpsServices(res: Response) {
    const { whereaboutsMaintenanceMode } = config.app
    const { keyworkerMaintenanceMode } = config.app
    const { activeCaseLoadId } = res.locals.user

    let whereaboutsConfig
    if (whereaboutsMaintenanceMode) {
      whereaboutsConfig = { enabled: false }
    } else {
      whereaboutsConfig = await this.homepageService
        .getWhereaboutsConfig(res.locals.clientToken, activeCaseLoadId)
        ?.catch(() => null)
    }

    let keyworkerPrisonStatus
    if (keyworkerMaintenanceMode) {
      keyworkerPrisonStatus = { migrated: false } // this can be empty because we're using the feature flag in getTasks
    } else {
      keyworkerPrisonStatus = await this.homepageService
        .getPrisonMigrationStatus(res.locals.clientToken, activeCaseLoadId)
        ?.catch(() => null)
    }

    const staffRoles = await this.homepageService.getStaffRoles(
      res.locals.clientToken,
      activeCaseLoadId,
      res.locals.user.staffId,
    )

    const roleCodes = [...res.locals.user.userRoles, ...staffRoles.map(staffRole => staffRole.role)]

    const allServices = getTasks(
      res.locals.user.activeCaseLoadId,
      res.locals.user.locations,
      res.locals.user.staffId,
      whereaboutsConfig,
      keyworkerPrisonStatus,
      roleCodes,
    )

    return allServices
  }
}
