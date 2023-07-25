import { dataAccess } from '../data'
import UserService from './userService'
import HomepageService from './homepageService'
import HmppsCache from '../middleware/hmppsCache'
import config from '../config'

export const services = () => {
  const { hmppsAuthClientBuilder, prisonApiClientBuilder, applicationInfo } = dataAccess

  const todayCache = new HmppsCache(config.todayCacheTTL)
  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const homepageService = new HomepageService(prisonApiClientBuilder)

  return {
    dataAccess,
    applicationInfo,
    userService,
    homepageService,
    todayCache,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
