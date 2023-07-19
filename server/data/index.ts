/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'
import HmppsAuthClient, { systemTokenBuilder } from './hmppsAuthClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import config, { ApiConfig } from '../config'
import RestClient, { RestClientBuilder as CreateRestClientBuilder } from './restClient'
import PrisonApiRestClient from './prisonApiClient'
import { PrisonApiClient } from './interfaces/prisonApiClient'

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
  hmppsAuthClientBuilder: restClientBuilder<HmppsAuthClient>(
    'HMPPS AuthClient',
    config.apis.hmppsAuth,
    HmppsAuthClient,
  ),
  prisonApiClientBuilder: restClientBuilder<PrisonApiClient>('Prison API', config.apis.prisonApi, PrisonApiRestClient),
  systemToken: systemTokenBuilder(new TokenStore(createRedisClient())),
}

export type DataAccess = typeof dataAccess

export { HmppsAuthClient, RestClientBuilder }
