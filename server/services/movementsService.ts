import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { mapAlerts } from './utils/alertFlagLabels'
import { PrisonerWithAlerts } from './interfaces/establishmentRollService/PrisonerWithAlerts'

export default class MovementsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>,
  ) {}

  public async getArrivedTodayPrisoners(clientToken: string, caseLoadId: string): Promise<PrisonerWithAlerts[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const movements = await prisonApi.getMovementsIn(caseLoadId, new Date().toISOString())

    if (!movements || !movements?.length) return []
    const prisoners = await prisonerSearchClient.getPrisonersById(movements.map(movement => movement.offenderNo))

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const prisonerMovement = movements.find(movement => movement.offenderNo === prisoner.prisonerNumber)
        return {
          ...prisoner,
          movementTime: prisonerMovement?.movementTime,
          arrivedFrom: prisonerMovement?.fromAgencyDescription || prisonerMovement?.fromCity,
          alertFlags: mapAlerts(prisoner),
        }
      })
  }
}
