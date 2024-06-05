import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { dataAccess } from '../data'
import UserService from './userService'
import HomepageService from './homepageService'
import HmppsCache from '../middleware/hmppsCache'
import config from '../config'
import ContentfulService from './contentfulService'
import EstablishmentRollService from './establishmentRollService'
import MovementsService from './movementsService'
import LocationService from './locationsService'

export const services = () => {
  const {
    prisonApiClientBuilder,
    whereAboutsApiClientBuilder,
    keyWorkerApiClientBuilder,
    prisonerSearchApiClientBuilder,
    applicationInfo,
  } = dataAccess

  const todayCache = new HmppsCache(config.todayCacheTTL)
  const userService = new UserService(prisonApiClientBuilder)
  const homepageService = new HomepageService(
    prisonApiClientBuilder,
    whereAboutsApiClientBuilder,
    keyWorkerApiClientBuilder,
  )
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
    homepageService,
    todayCache,
    contentfulService,
    establishmentRollService,
    movementsService,
    locationsService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
