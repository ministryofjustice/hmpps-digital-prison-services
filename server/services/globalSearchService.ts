import { RestClientBuilder } from '../data'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import Prisoner from '../data/interfaces/prisoner'
import { PagedList } from '../data/interfaces/pagedList'
import { GlobalSearchQueryParams } from '../utils/generateListMetadata'

export default class GlobalSearchService {
  constructor(private readonly prisonerSearchApiClientBuilder: RestClientBuilder<PrisonerSearchClient>) {}

  public async getResultsForUser(
    clientToken: string,
    globalSearchParams: {
      searchTerm: string
      page: number
      gender: GlobalSearchQueryParams['gender']
      location: GlobalSearchQueryParams['location']
      dateOfBirth: string
    },
  ): Promise<PagedList<Prisoner>> {
    const { searchTerm, ...params } = globalSearchParams
    const text = searchTerm.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim()
    const isPrisonerIdentifier = (str: string) => /\d/.test(str)
    const prisonerSearchClient = this.prisonerSearchApiClientBuilder(clientToken)
    const includedFields = [
      'firstName',
      'lastName',
      'prisonerNumber',
      'dateOfBirth',
      'locationDescription',
      'prisonId',
      'currentFacialImageId',
      'status',
      'bookingId',
    ]

    if (isPrisonerIdentifier(text)) {
      return prisonerSearchClient.globalSearch(
        {
          ...params,
          prisonerIdentifier: text,
        },
        includedFields,
      )
    }

    const [lastName, firstName] = text.split(' ')
    return prisonerSearchClient.globalSearch(
      {
        ...params,
        firstName,
        lastName,
      },
      includedFields,
    )
  }
}
