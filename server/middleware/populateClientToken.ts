import { RequestHandler } from 'express'
import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import logger from '../../logger'

export default function populateClientToken(authenticationClient: AuthenticationClient): RequestHandler {
  return async (req, res, next) => {
    try {
      if (res.locals.user) {
        const clientToken = await authenticationClient.getToken(res.locals.user.username)
        if (clientToken) {
          req.middleware = { ...req.middleware, clientToken }
        } else {
          logger.info('No client token available')
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to retrieve client token for: ${res.locals.user && res.locals.user.username}`)
      next(error)
    }
  }
}
