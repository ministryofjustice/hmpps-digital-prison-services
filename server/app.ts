import express, { Request } from 'express'
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'

import { getFrontendComponents, retrieveCaseLoadData } from '@ministryofjustice/hmpps-connect-dps-components'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes, { standardGetPaths } from './routes'
import type { Services } from './services'
import setUpPageNotFound from './middleware/setUpPageNotFound'
import setUpEnvironmentName from './middleware/setUpEnvironmentName'
import logger from '../logger'
import config from './config'
import { ensureActiveCaseLoadSet } from './middleware/ensureActiveCaseLoadSet'
import populateClientToken from './middleware/populateClientToken'
import populateCurrentUser from './middleware/populateCurrentUser'
import populateUserLocations from './middleware/populateUserLocations'
import { setUpSentry, setUpSentryErrorHandler } from './middleware/setUpSentry'
import forGetRequestsMatching from './utils/forGetRequestsMatching'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  setUpSentry()
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  setUpEnvironmentName(app)
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware(['ROLE_PRISON']))
  app.use(setUpCsrf())
  app.use(populateCurrentUser())
  app.use(populateClientToken(services.dataAccess.hmppsAuthClient))

  app.use(
    forGetRequestsMatching(
      [standardGetPaths],
      getFrontendComponents({
        logger,
        componentApiConfig: config.apis.componentApi,
        dpsUrl: config.serviceUrls.digitalPrisons,
        requestOptions: { includeSharedData: true },
      }),
    ),
  )
  app.use(retrieveCaseLoadData({ logger, prisonApiConfig: config.apis.prisonApi }))
  app.use(ensureActiveCaseLoadSet(services.userService))
  app.use(populateUserLocations(services.userService))
  app.use(
    telemetryMiddleware.addUserMetadataToTelemetry({
      getAttributes: (req: Request) => ({ username: req.user?.username }),
    }),
  )
  app.use(routes(services))

  app.use(setUpPageNotFound)
  setUpSentryErrorHandler(app)
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
