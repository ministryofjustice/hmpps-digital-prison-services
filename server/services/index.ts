import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { dataAccess as initDataAccess } from '../data'
import UserService from './userService'
import config from '../config'
import ContentfulService from './contentfulService'
import EstablishmentRollService from './establishmentRollService'
import ServiceData from '../controllers/ServiceData'
import DietReportingService from './dietReportingService'
import PdfRenderingService from './pdfRenderingService'
import GotenbergRestApiClient from '../data/gotenbergApiClient'
import AuditService from './auditService'
import HmppsCache from '../middleware/hmppsCache'
import { WhatsNewData } from '../data/interfaces/whatsNewData'
import GlobalSearchService from './globalSearchService'

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
        fetchPolicy: 'no-cache',
      },
    },
  })
  const gotenbergClient = new GotenbergRestApiClient(config.apis.gotenberg)

  const auditService = new AuditService(config.audit.enabled)
  const contentfulService = new ContentfulService(apolloClient)
  const dietReportingService = new DietReportingService(healthAndMedicationApiClientBuilder, prisonApiClientBuilder)
  const pdfRenderingService = new PdfRenderingService(gotenbergClient)
  const globalSearchService = new GlobalSearchService(dataAccess.prisonerSearchApiClientBuilder)

  // Caches
  const whatsNewCache = new HmppsCache<WhatsNewData>(config.cache.whatsNewTtl)
  const outageBannerCache = new HmppsCache<string>(config.cache.outageBannerTtl)

  return {
    applicationInfo,
    auditService,
    contentfulService,
    dataAccess,
    dietReportingService,
    establishmentRollService,
    pdfRenderingService,
    globalSearchService,
    serviceData,
    userService,
    whatsNewCache,
    outageBannerCache,
  }
}

export type Services = ReturnType<typeof services>

export { UserService }
