/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'
import { systemTokenBuilder } from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import config, { ApiConfig } from '../config'
import RestClient, { RestClientBuilder as CreateRestClientBuilder } from './restClient'
import PrisonApiRestClient from './prisonApiClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import { HealthAndMedicationApiClient } from './interfaces/healthAndMedicationApiClient'
import HealthAndMedicationRestApiClient from './healthAndMedicationRestApiClient'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

type RestClientBuilder<T> = (token: string) => T

export default function restClientBuilder<T>(
  name: string,
  options: ApiConfig,
  constructor: new (client: RestClient) => T,
): RestClientBuilder<T> {
  const restClient = CreateRestClientBuilder(name, options)
  return token => new constructor(restClient(token))
}

export const dataAccess = {
  applicationInfo,
  prisonApiClientBuilder: restClientBuilder<PrisonApiClient>('Prison API', config.apis.prisonApi, PrisonApiRestClient),
  systemToken: systemTokenBuilder(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  healthAndMedicationApiClientBuilder: restClientBuilder<HealthAndMedicationApiClient>(
    'Health and Medication API',
    config.apis.healthAndMedicationApi,
    HealthAndMedicationRestApiClient,
  ),
}

export type { RestClientBuilder }
