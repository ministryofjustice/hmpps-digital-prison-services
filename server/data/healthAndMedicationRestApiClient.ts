import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'
import {
  HealthAndMedicationApiClient,
  HealthAndMedicationFilters,
  HealthAndMedicationForPrison,
} from './interfaces/healthAndMedicationApiClient'
import { PagedList } from './interfaces/pagedList'
import config from '../config'
import RestClient from './restClient'

export default class HealthAndMedicationRestApiClient extends RestClient implements HealthAndMedicationApiClient {
  constructor(token: string) {
    super('Health and Medication API', config.apis.healthAndMedicationApi, token)
  }

  async getHealthAndMedicationForPrison(
    prisonId: string,
    query: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>> {
    const { page, size, nameAndNumber, location, showAll } = query

    // Default to prisoner name A-Z
    let sort = `prisonerName,asc`
    if (nameAndNumber) sort = `prisonerName,${nameAndNumber.toLowerCase()}`
    if (location) sort = `location,${location.toLowerCase()}`

    return this.post<PagedList<HealthAndMedicationForPrison>>(
      {
        path: `/prisons/${prisonId}`,
        data: { filters: this.filtersFromQuery(query), page, size: showAll ? 99999 : size, sort },
      },
      this.token,
    )
  }

  async getFiltersForPrison(prisonId: string): Promise<HealthAndMedicationFilters> {
    return this.get<HealthAndMedicationFilters>(
      {
        path: `/prisons/${prisonId}/filters`,
      },
      this.token,
    )
  }

  private filtersFromQuery(query: DietaryRequirementsQueryParams) {
    if (query.medicalDiet || query.personalDiet || query.foodAllergies) {
      return {
        foodAllergies: query.foodAllergies,
        medicalDietaryRequirements: query.medicalDiet,
        personalisedDietaryRequirements: query.personalDiet,
      }
    }

    return null
  }
}
