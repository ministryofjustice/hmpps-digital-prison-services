import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { dataAccess } from '../data'
import UserService from './userService'
import HomepageService from './homepageService'
import HmppsCache from '../middleware/hmppsCache'
import config from '../config'
import ContentfulService from './contentfulService'
import ComponentService from './componentService'
import EstablishmentRollService from './establishmentRollService'
import MovementsService from './movementsService'

export const services = () => {
  const {
    prisonApiClientBuilder,
    whereAboutsApiClientBuilder,
    keyWorkerApiClientBuilder,
    componentApiClientBuilder,
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
  const componentService = new ComponentService(componentApiClientBuilder)
  const establishmentRollService = new EstablishmentRollService(prisonApiClientBuilder)
  const movementsService = new MovementsService(prisonApiClientBuilder, prisonerSearchApiClientBuilder)

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
    componentService,
    establishmentRollService,
    movementsService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
