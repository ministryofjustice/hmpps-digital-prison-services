import { RestClientBuilder } from '../data'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import { PrisonUser } from '../interfaces/prisonUser'

export default class PrisonerSearchService {
  constructor(private readonly prisonerSearchApiClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  public async getResults(clientToken: string, user: PrisonUser, queryParams: PrisonerSearchQueryParams) {
    const { activeCaseLoadId } = user
    const { location, size, page, term, alerts, sort, showAll } = queryParams

    const prisonerSearchClient = this.prisonerSearchApiClientBuilder(clientToken)
    return prisonerSearchClient.locationSearch(activeCaseLoadId, {
      location: (location === activeCaseLoadId || !location) ? '' : `${location}-`, // Dash added to ensure correct results.
      size,
      page,
      term,
      alerts,
      sort,
      showAll,
    })
  }
}
