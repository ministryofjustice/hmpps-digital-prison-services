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
import PrisonerSearchRestClient from './prisonerSearchClient'
import RedisTokenStore from './tokenStore/redisTokenStore'
import InMemoryTokenStore from './tokenStore/inMemoryTokenStore'
import LocationsInsidePrisonApiRestClient from './locationsInsidePrisonApiClient'

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
  prisonerSearchApiClientBuilder: restClientBuilder<PrisonerSearchRestClient>(
    'Prisoner Search API',
    config.apis.prisonerSearchApi,
    PrisonerSearchRestClient,
  ),
  locationsInsidePrisonApiClientBuilder: restClientBuilder<LocationsInsidePrisonApiRestClient>(
    'Locations Inside Prison API',
    config.apis.locationsInsidePrisonApi,
    LocationsInsidePrisonApiRestClient,
  ),
}

export { RestClientBuilder }
