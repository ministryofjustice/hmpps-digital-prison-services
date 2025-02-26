import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import EstablishmentRollSummary from './interfaces/establishmentRollService/EstablishmentRollSummary'

export default class EstablishmentRollService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  getEstablishmentRollSummary(clientToken: string, caseLoadId: string): Promise<EstablishmentRollSummary> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    return prisonApi.getPrisonRollCountSummary(caseLoadId)
  }
}
