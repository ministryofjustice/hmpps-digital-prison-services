import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { convertToTitleCase } from '../utils/utils'
import { Role } from '../enums/role'
import { PrisonUser } from '../interfaces/prisonUser'

export function populateCurrentUser(): RequestHandler {
  return async (req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        authorities?: Role[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        name,
        displayName: convertToTitleCase(name),
        userRoles: roles?.map(role => role.substring(role.indexOf('_') + 1)),
      }

      if (res.locals.user.authSource === 'nomis') {
        res.locals.user.staffId = parseInt(userId, 10) || undefined
      }

      next()
    } catch (error) {
      logger.error(error, `Failed to populate user details for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}

export function getUserCaseLoads(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user && res.locals.user.authSource === 'nomis') {
        const userCaseLoads = res.locals.user && (await userService.getUserCaseLoads(res.locals.user.token))
        if (userCaseLoads && Array.isArray(userCaseLoads)) {
          const availableCaseLoads = userCaseLoads.filter(caseload => caseload.type !== 'APP')
          const activeCaseLoad = await getActiveCaseload(availableCaseLoads, userService, res.locals.user)

          res.locals.user.caseLoads = availableCaseLoads
          res.locals.user.activeCaseLoad = activeCaseLoad
          res.locals.user.activeCaseLoadId = activeCaseLoad?.caseLoadId
        } else {
          logger.info('No user case loads available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve case loads for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}

async function getActiveCaseload(
  caseloads: CaseLoad[],
  userService: UserService,
  user: PrisonUser,
): Promise<CaseLoad | null> {
  const activeCaseload = caseloads.find(caseload => caseload.currentlyActive)
  if (activeCaseload) {
    return activeCaseload
  }
  const potentialCaseLoad = caseloads.find(cl => cl.caseLoadId !== '___')
  if (potentialCaseLoad) {
    logger.warn(`No active caseload set for user: ${user.username}: setting to ${potentialCaseLoad.caseLoadId}`)
    await userService.setActiveCaseload(user.token, potentialCaseLoad)

    return potentialCaseLoad
  }

  return null
}

export function getUserLocations(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user && res.locals.user.authSource === 'nomis') {
        const locations = await userService.getUserLocations(res.locals.user.token)
        if (locations && Array.isArray(locations)) {
          res.locals.user.locations = locations.filter(location => location.locationId !== -1)
        } else {
          logger.info('No user locations available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve locations for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
