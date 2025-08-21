import { ApiConfig, RestClient as HmppsRestClient } from '@ministryofjustice/hmpps-rest-client'
import logger from '../../logger'

export default class RestClient extends HmppsRestClient {
  constructor(
    protected readonly name: string,
    protected readonly config: ApiConfig,
    protected readonly token: string,
  ) {
    super(name, config, logger)
  }
}
