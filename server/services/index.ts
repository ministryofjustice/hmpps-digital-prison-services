import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { dataAccess } from '../data'
import UserService from './userService'
import config from '../config'
import ContentfulService from './contentfulService'
import EstablishmentRollService from './establishmentRollService'
import ServiceData from '../controllers/ServiceData'
import DietReportingService from './dietReportingService'
import PdfRenderingService from './pdfRenderingService'
import GotenbergRestApiClient from '../data/gotenbergApiClient'

export const services = () => {
  const { prisonApiClientBuilder, applicationInfo } = dataAccess

  const userService = new UserService(prisonApiClientBuilder)
  const establishmentRollService = new EstablishmentRollService(prisonApiClientBuilder)

  const serviceData = new ServiceData()

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${config.contentful.host}/content/v1/spaces/${config.contentful.spaceId}/environments/${config.contentful.environment}`,
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

  const dietReportingService = new DietReportingService(
    dataAccess.healthAndMedicationApiClientBuilder,
    dataAccess.prisonApiClientBuilder,
  )

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
