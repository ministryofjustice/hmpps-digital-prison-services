import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'
import {
  HealthAndMedication,
  HealthAndMedicationApiClient,
  HealthAndMedicationForPrison,
} from './interfaces/healthAndMedicationApiClient'
import { PagedList } from './interfaces/pagedList'
import RestClient from './restClient'

export default class HealthAndMedicationRestApiClient implements HealthAndMedicationApiClient {
  constructor(private restClient: RestClient) {}

  private async post<T>(args: object): Promise<T> {
    return this.restClient.post<T>(args)
  }

  async getHealthAndMedicationForPrison(
    prisonId: string,
    { page, size, nameAndNumber, location, showAll }: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>> {
    let sort
    if (nameAndNumber) sort = `prisonerName,${nameAndNumber.toLowerCase()}`
    if (location) sort = `location,${location.toLowerCase()}`

    return this.restClient.post<PagedList<HealthAndMedicationForPrison>>({
      path: `/prisons/${prisonId}`,
      data: { page, size: showAll ? 99999 : size, sort },
    })
  }
}
