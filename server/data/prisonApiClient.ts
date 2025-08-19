import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { asUser, RestClient } from '@ministryofjustice/hmpps-rest-client'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { LatestArrivalDateInfo } from './interfaces/latestArrivalDateInfo'
import logger from '../../logger'
import config from '../config'
import PrisonRollCount from './interfaces/prisonRollCount'
import EstablishmentRollSummary from '../services/interfaces/establishmentRollService/EstablishmentRollSummary'
import { PrisonApiClient } from './interfaces/prisonApiClient'

export default class PrisonApiRestClient extends RestClient implements PrisonApiClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Prison API', config.apis.prisonApi, logger, authenticationClient)
  }

  getUserCaseLoads(token: string): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' }, asUser(token))
  }

  getUserLocations(token: string): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' }, asUser(token))
  }

  setActiveCaseload(token: string, caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.put<Record<string, string>>({ path: '/api/users/me/activeCaseLoad', data: caseLoad }, asUser(token))
  }

  getPrisonRollCountSummary(token: string, prisonId: string): Promise<EstablishmentRollSummary> {
    return this.get<PrisonRollCount>({ path: `/api/prison/roll-count/${prisonId}/summary` }, asUser(token))
  }

  getLatestArrivalDates(token: string, prisonerNumbers: string[]): Promise<LatestArrivalDateInfo[]> {
    return this.post<LatestArrivalDateInfo[]>(
      {
        path: '/api/movements/offenders/latest-arrival-date',
        data: prisonerNumbers,
      },
      asUser(token),
    )
  }
}
