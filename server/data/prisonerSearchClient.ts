import RestClient from './restClient'
import { Prisoner } from './interfaces/prisoner'
import { PrisonerSearchClient } from './interfaces/prisonerSearchClient'
import { PagedList } from './interfaces/pagedList'

export default class PrisonerSearchRestClient implements PrisonerSearchClient {
  constructor(private restClient: RestClient) {}

  async getPrisonersById(prisonerNumbers: string[]): Promise<Prisoner[]> {
    return this.restClient.post<Prisoner[]>({
      path: '/prisoner-search/prisoner-numbers',
      data: { prisonerNumbers },
    })
  }

  async getCswapPrisonersInEstablishment(prisonId: string): Promise<PagedList<Prisoner>> {
    const attributeRequest = {
      joinType: 'AND',
      queries: [
        {
          joinType: 'AND',
          matchers: [
            {
              type: 'String',
              attribute: 'prisonId',
              condition: 'IS',
              searchTerm: prisonId,
            },
            {
              type: 'String',
              attribute: 'cellLocation',
              condition: 'IN',
              searchTerm: 'CSWAP',
            },
          ],
        },
      ],
    }
    return this.restClient.post<PagedList<Prisoner>>({
      path: '/attribute-search?size=2000',
      data: attributeRequest,
    })
  }
}
