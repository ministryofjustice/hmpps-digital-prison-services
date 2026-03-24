import { RequestHandler } from 'express'
import { UserService } from '../services'
import logger from '../../logger'

export default function populateUserLocations(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user && res.locals.user.authSource === 'nomis') {
        const { activeCaseLoadId, username, token } = res.locals.user
        const locations = await userService.getUserLocations(activeCaseLoadId, username)
        if (locations && Array.isArray(locations)) {
          res.locals.user.locations = locations
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
