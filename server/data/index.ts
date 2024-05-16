/* eslint-disable import/first */
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
import { WhereAboutsApiClient } from './interfaces/whereAboutsApiClient'
import WhereAboutsApiRestClient from './whereAboutsApiClient'
import { KeyWorkerApiClient } from './interfaces/keyWorkerApiClient'
import KeyWorkerApiRestClient from './keyWorkerApiClient'
import { ComponentApiClient } from './interfaces/componentApiClient'
import ComponentApiRestClient from './componentApiClient'
import PrisonerSearchRestClient from './prisonerSearchClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'

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
  whereAboutsApiClientBuilder: restClientBuilder<WhereAboutsApiClient>(
    'Whereabouts API',
    config.apis.whereabouts,
    WhereAboutsApiRestClient,
  ),
  keyWorkerApiClientBuilder: restClientBuilder<KeyWorkerApiClient>(
    'Keyworker API',
    config.apis.keyworker,
    KeyWorkerApiRestClient,
  ),
  componentApiClientBuilder: restClientBuilder<ComponentApiClient>(
    'Component API',
    config.apis.frontendComponents,
    ComponentApiRestClient,
  ),
  systemToken: systemTokenBuilder(
    config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
  ),
  prisonerSearchApiClientBuilder: restClientBuilder<PrisonerSearchRestClient>(
    'Prisoner Search API',
    config.apis.prisonerSearchApi,
    PrisonerSearchRestClient,
  ),
}

export { RestClientBuilder }
