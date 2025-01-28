import { RestClientBuilder } from '../data'
import {
  HealthAndMedicationApiClient,
  HealthAndMedicationForPrison,
} from '../data/interfaces/healthAndMedicationApiClient'
import { PagedList } from '../data/interfaces/pagedList'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'

export default class DietReportingService {
  constructor(private readonly healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>) {}

  public async getDietaryRequirementsForPrison(
    token: string,
    prisonId: string,
    query: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>> {
    const healthAndMedicationApi = this.healthAndMedicationApiClientBuilder(token)
    return healthAndMedicationApi.getHealthAndMedicationForPrison(prisonId, query)
  }
}
