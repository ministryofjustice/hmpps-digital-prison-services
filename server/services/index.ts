import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'
import { dataAccess as initDataAccess } from '../data'
import UserService from './userService'
import config from '../config'
import ContentfulService from './contentfulService'
import EstablishmentRollService from './establishmentRollService'
import ServiceData from '../controllers/ServiceData'
import DietReportingService from './dietReportingService'
import PdfRenderingService from './pdfRenderingService'
import GotenbergRestApiClient from '../data/gotenbergApiClient'

export const services = () => {
  const dataAccess = initDataAccess()
  const { applicationInfo, prisonApiClientBuilder, healthAndMedicationApiClientBuilder } = dataAccess

  const userService = new UserService(prisonApiClientBuilder)
  const establishmentRollService = new EstablishmentRollService(prisonApiClientBuilder)

  const serviceData = new ServiceData()

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${config.contentful.host}/content/v1/spaces/${config.contentful.spaceId}/environments/${config.contentful.environment}`,
      headers: {
        Authorization: `Bearer ${config.contentful.accessToken}`,
      },
    }),
    ssrMode: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })

  const contentfulService = new ContentfulService(apolloClient)

  const dietReportingService = new DietReportingService(healthAndMedicationApiClientBuilder, prisonApiClientBuilder)

  const gotenbergClient = new GotenbergRestApiClient(config.apis.gotenberg)
  const pdfRenderingService = new PdfRenderingService(gotenbergClient)

  return {
    dataAccess,
    applicationInfo,
    userService,
    contentfulService,
    establishmentRollService,
    serviceData,
    dietReportingService,
    pdfRenderingService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
