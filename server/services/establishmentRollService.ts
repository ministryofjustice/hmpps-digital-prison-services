import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import EstablishmentRollSummary from './interfaces/establishmentRollService/EstablishmentRollSummary'

export default class EstablishmentRollService {
  constructor(private readonly prisonApiClient: PrisonApiClient) {}

  getEstablishmentRollSummary(token: string, caseLoadId: string): Promise<EstablishmentRollSummary> {
    return this.prisonApiClient.getPrisonRollCountSummary(token, caseLoadId)
  }
}
