/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'
import { createRedisClient } from './redisClient'
import config from '../config'
import PrisonApiRestClient from './prisonApiClient'
import HealthAndMedicationRestApiClient from './healthAndMedicationRestApiClient'
import logger from '../../logger'
import PrisonerSearchRestClient from './prisonerSearchApiClient'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

export type RestClientBuilder<T> = (token: string) => T

// This lexical binding of the initialised flag ensures that
// we can only call the dataAccess function once in the application lifecycle
const initialiseDataAccess = () => {
  let initialised = false

  return () => {
    if (!initialised) {
      logger.info('Initialising data access')
      initialised = true

      const hmppsAuthClient = new AuthenticationClient(
        config.apis.hmppsAuth,
        logger,
        config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
      )

      return {
        applicationInfo,
        hmppsAuthClient,
        prisonApiClientBuilder: (token: string) => new PrisonApiRestClient(token),
        healthAndMedicationApiClientBuilder: (token: string) => new HealthAndMedicationRestApiClient(token),
        prisonerSearchApiClientBuilder: (token: string) => new PrisonerSearchRestClient(token),
      }
    }
    throw new Error('Data access already initialised')
  }
}

export const dataAccess = initialiseDataAccess()
