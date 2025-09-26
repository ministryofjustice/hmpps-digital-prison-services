import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import { CaseLoad } from '../data/interfaces/caseLoad'
import { PrisonUser } from '../interfaces/prisonUser'

export function ensureActiveCaseLoadSet(userService: UserService): RequestHandler {
  return async (_req, res, next) => {
    try {
      if (res.locals.user && res.locals.user.activeCaseLoad && res.locals.user.activeCaseLoadId) return next()

      if (res.locals.user && res.locals.user.caseLoads) {
        const activeCaseLoad = await getActiveCaseload(res.locals.user.caseLoads, userService, res.locals.user)
        res.locals.user.activeCaseLoad = activeCaseLoad
        res.locals.user.activeCaseLoadId = activeCaseLoad?.caseLoadId
      }
      return next()
    } catch (error) {
      logger.error(error, `Failed to initialise active case load for: ${res.locals.user && res.locals.user.username}`)
      return next(error)
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

export default { ensureActiveCaseLoadSet }
