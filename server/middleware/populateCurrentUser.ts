import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import logger from '../../logger'
import UserService from '../services/userService'
import { convertToTitleCase } from '../utils/utils'
import { Role } from '../enums/role'

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
