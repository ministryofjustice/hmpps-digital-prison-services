import { Router } from 'express'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser, { getUserCaseLoads, getUserLocations, getUserRoles } from './populateCurrentUser'
import type { Services } from '../services'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(userService))
  router.use(getUserCaseLoads(userService))
  router.use(getUserLocations(userService))
  router.use(getUserRoles())
  return router
}
