import { Router } from 'express'
import { populateCurrentUser, getUserLocations } from './populateCurrentUser'
import type { Services } from '../services'

export default function setUpCurrentUser({ userService }: Services): Router {
  const router = Router({ mergeParams: true })
  router.use(populateCurrentUser())
  router.use(getUserLocations(userService))
  return router
}
