import { ApiConfig, RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import appConfig from '../config'
import logger, { warnLevelLogger } from '../../logger'

export default class RestClient extends HmppsRestClient {
  constructor(
    protected readonly name: string,
    protected readonly config: ApiConfig,
    protected readonly token: string,
  ) {
    // only log warn level and above in production for API clients to reduce app insights usage
    // (dependencies are separately tracked):
    super(name, config, appConfig.production ? warnLevelLogger : logger)
  }
}
