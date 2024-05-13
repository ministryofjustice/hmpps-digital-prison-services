import RestClient from './restClient'
import { Prisoner } from './interfaces/prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchClient'

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  constructor(private restClient: RestClient) {}

  async getPrisonersById(prisonerNumbers: string[]): Promise<Prisoner[]> {
    return this.restClient.post<Prisoner[]>({
      path: '/prisoner-search/prisoner-numbers',
      data: { prisonerNumbers },
    })
  }
}
