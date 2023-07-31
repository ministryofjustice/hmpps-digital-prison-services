import { dataAccess } from '../data'
import UserService from './userService'
import HomepageService from './homepageService'
import HmppsCache from '../middleware/hmppsCache'
import config from '../config'
import ContentfulService from './contentfulService'

export const services = () => {
  const {
    hmppsAuthClientBuilder,
    prisonApiClientBuilder,
    whereAboutsApiClientBuilder,
    keyWorkerApiClientBuilder,
    applicationInfo,
  } = dataAccess

  const todayCache = new HmppsCache(config.todayCacheTTL)
  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const homepageService = new HomepageService(
    prisonApiClientBuilder,
    whereAboutsApiClientBuilder,
    keyWorkerApiClientBuilder,
  )

  const contentfulService = new ContentfulService()

  return {
    dataAccess,
    applicationInfo,
    userService,
    homepageService,
    todayCache,
    contentfulService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
