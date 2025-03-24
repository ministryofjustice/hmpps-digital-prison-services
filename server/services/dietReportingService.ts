import { RestClientBuilder } from '../data'
import { HealthAndMedicationApiClient, HealthAndMedicationData } from '../data/interfaces/healthAndMedicationApiClient'
import { PagedList } from '../data/interfaces/pagedList'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'

export default class DietReportingService {
  constructor(
    private readonly healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
  ) {}

  public async getDietaryRequirementsForPrison(
    token: string,
    prisonId: string,
    query: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationData>> {
    const healthAndMedicationApi = this.healthAndMedicationApiClientBuilder(token)
    const prisonApi = this.prisonApiClientBuilder(token)

    const healthAndMedication = await healthAndMedicationApi.getHealthAndMedicationForPrison(prisonId, query)
    const prisonerNumbers = healthAndMedication.content.map(it => it.prisonerNumber)
    const arrivalDates = await prisonApi.getLatestArrivalDates(prisonerNumbers)

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
