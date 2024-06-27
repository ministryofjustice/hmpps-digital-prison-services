import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { dataAccess } from '../data'
import UserService from './userService'
import config from '../config'
import ContentfulService from './contentfulService'
import EstablishmentRollService from './establishmentRollService'
import MovementsService from './movementsService'
import LocationService from './locationsService'

export const services = () => {
  const { prisonApiClientBuilder, prisonerSearchApiClientBuilder, applicationInfo } = dataAccess

  const userService = new UserService(prisonApiClientBuilder)
  const establishmentRollService = new EstablishmentRollService(prisonApiClientBuilder)
  const movementsService = new MovementsService(prisonApiClientBuilder, prisonerSearchApiClientBuilder)
  const locationsService = new LocationService(prisonApiClientBuilder)

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${config.contentful.host}/content/v1/spaces/${config.contentful.spaceId}/environments/master`,
    headers: {
      Authorization: `Bearer ${config.contentful.accessToken}`,
    },
    ssrMode: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })

  const contentfulService = new ContentfulService(apolloClient)

  return {
    dataAccess,
    applicationInfo,
    userService,
    contentfulService,
    establishmentRollService,
    movementsService,
    locationsService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
