import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { DietaryRequirementsQueryParams } from '../utils/generateListMetadata'
import { HealthAndMedicationApiClient, HealthAndMedicationForPrison } from './interfaces/healthAndMedicationApiClient'
import { PagedList } from './interfaces/pagedList'
import config from '../config'
import logger from '../../logger'

export default class HealthAndMedicationRestApiClient extends RestClient implements HealthAndMedicationApiClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Health and Medication API', config.apis.healthAndMedicationApi, logger, authenticationClient)
  }

  async getHealthAndMedicationForPrison(
    token: string,
    prisonId: string,
    { page, size, nameAndNumber, location, showAll }: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>> {
    // Default to prisoner name A-Z
    let sort = `prisonerName,asc`
    if (nameAndNumber) sort = `prisonerName,${nameAndNumber.toLowerCase()}`
    if (location) sort = `location,${location.toLowerCase()}`

    return this.post<PagedList<HealthAndMedicationForPrison>>(
      {
        path: `/prisons/${prisonId}`,
        data: { page, size: showAll ? 99999 : size, sort },
      },
      asUser(token),
    )
  }
}
