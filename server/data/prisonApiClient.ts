import { Readable } from 'stream'
import { CaseLoad } from './interfaces/caseLoad'
import { Location } from './interfaces/location'
import { LatestArrivalDateInfo } from './interfaces/latestArrivalDateInfo'
import config from '../config'
import PrisonRollCount from './interfaces/prisonRollCount'
import EstablishmentRollSummary from '../services/interfaces/establishmentRollService/EstablishmentRollSummary'
import { PrisonApiClient } from './interfaces/prisonApiClient'
import RestClient from './restClient'

export default class PrisonApiRestClient extends RestClient implements PrisonApiClient {
  constructor(token: string) {
    super('Prison API', config.apis.prisonApi, token)
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.get<CaseLoad[]>({ path: '/api/users/me/caseLoads', query: 'allCaseloads=true' }, this.token)
  }

  getUserLocations(): Promise<Location[]> {
    return this.get<Location[]>({ path: '/api/users/me/locations' }, this.token)
  }

  setActiveCaseload(caseLoad: CaseLoad): Promise<Record<string, string>> {
    return this.put<Record<string, string>>({ path: '/api/users/me/activeCaseLoad', data: caseLoad }, this.token)
  }

  getPrisonRollCountSummary(prisonId: string): Promise<EstablishmentRollSummary> {
    return this.get<PrisonRollCount>({ path: `/api/prison/roll-count/${prisonId}/summary` }, this.token)
  }

  getLatestArrivalDates(prisonerNumbers: string[]): Promise<LatestArrivalDateInfo[]> {
    return this.post<LatestArrivalDateInfo[]>(
      {
        path: '/api/movements/offenders/latest-arrival-date',
        data: prisonerNumbers,
      },
      this.token,
    )
  }

  getPrisonerImage(offenderNumber: string, fullSizeImage: boolean): Promise<Readable> {
    return this.stream(
      {
        path: `/api/bookings/offenderNo/${offenderNumber}/image/data?fullSizeImage=${fullSizeImage}`,
      },
      this.token,
    )
  }
}
