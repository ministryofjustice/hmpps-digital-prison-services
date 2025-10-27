import { PrisonerSearchQueryParams } from '../../utils/generateListMetadata'
import { PagedList } from './pagedList'
import Prisoner from './prisoner'

export interface PrisonerSearchResponse {
  totalElements: number
  totalPages: number
  size: number
  content: Prisoner[]

  number: number
  first: boolean
  last: boolean
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number

  pageable: {
    offset: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
}

export interface PrisonerSearchClient {
  getPrisonerDetails(prisonerNumber: string): Promise<Prisoner>
  locationSearch(prisonId: string, queryParams: PrisonerSearchQueryParams): Promise<PagedList<Prisoner>>
}
