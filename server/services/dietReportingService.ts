import { HealthAndMedicationApiClient, HealthAndMedicationData } from '../data/interfaces/healthAndMedicationApiClient'
import { PagedList } from '../data/interfaces/pagedList'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

export default class DietReportingService {
  constructor(
    private readonly healthAndMedicationApiClient: HealthAndMedicationApiClient,
    private readonly prisonApiClient: PrisonApiClient,
  ) {}

  public async getDietaryRequirementsForPrison(
    token: string,
    prisonId: string,
    query: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationData>> {
    const healthAndMedication = await this.healthAndMedicationApiClient.getHealthAndMedicationForPrison(
      token,
      prisonId,
      query,
    )
    const prisonerNumbers = healthAndMedication.content.map(it => it.prisonerNumber)
    const arrivalDates = await this.prisonApiClient.getLatestArrivalDates(token, prisonerNumbers)

    const healthAndMedicationData: HealthAndMedicationData[] = []
    healthAndMedication.content.forEach(entry => {
      const arrivalDate = arrivalDates.find(item => item.offenderNo === entry.prisonerNumber)?.latestArrivalDate
      healthAndMedicationData.push({
        ...entry,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
      })
    })

    return {
      metadata: healthAndMedication.metadata,
      content: healthAndMedicationData,
    }
  }
}
