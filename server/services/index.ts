import { dataAccess } from '../data'
import UserService from './userService'
import HomepageService from './homepageService'

export const services = () => {
  const { hmppsAuthClientBuilder, prisonApiClientBuilder, applicationInfo } = dataAccess

  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const homepageService = new HomepageService(prisonApiClientBuilder)

  return {
    dataAccess,
    applicationInfo,
    userService,
    homepageService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
