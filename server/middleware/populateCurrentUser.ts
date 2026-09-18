import { RequestHandler } from 'express'
import { jwtDecode } from 'jwt-decode'
import { UUID } from 'crypto'
import logger from '../../logger'
import { convertToTitleCase } from '../utils/utils'
import { Role } from '../enums/role'

export default function populateCurrentUser(): RequestHandler {
  return async (_req, res, next) => {
    try {
      const {
        name,
        user_id: userId,
        user_uuid: userUuid,
        authorities: roles = [],
      } = jwtDecode(res.locals.user.token) as {
        name?: string
        user_id?: string
        user_uuid?: UUID
        authorities?: Role[]
      }

      res.locals.user = {
        ...res.locals.user,
        userId,
        userUuid,
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
