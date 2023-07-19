import { dataAccess } from '../data'
import UserService from './userService'

export const services = () => {
  const { hmppsAuthClientBuilder, prisonApiClientBuilder, applicationInfo } = dataAccess

  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)

  return {
    dataAccess,
    applicationInfo,
    userService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
