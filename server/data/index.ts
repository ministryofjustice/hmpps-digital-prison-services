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

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

export const dataAccess = () => {
  const hmppsAuthClient = new AuthenticationClient(
    config.apis.hmppsAuth,
    logger,
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  )

  return {
    applicationInfo,
    prisonApiClient: new PrisonApiRestClient(hmppsAuthClient),
    healthAndMedicationApiClient: new HealthAndMedicationRestApiClient(hmppsAuthClient),
  }
}

export type DataAccess = ReturnType<typeof dataAccess>
