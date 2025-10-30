import config from '../config'
import { GlobalSearchQueryParams, PrisonerSearchQueryParams } from '../utils/generateListMetadata'
import { PagedList } from './interfaces/pagedList'
import Prisoner from './interfaces/prisoner'
import { PrisonerSearchClient, PrisonerSearchResponse } from './interfaces/prisonerSearchClient'
import RestClient from './restClient'
import { mapToQueryString } from '../utils/utils'

export default class PrisonerSearchRestClient extends RestClient implements PrisonerSearchClient {
  constructor(token: string) {
    super('Prison Offender Search API', config.apis.prisonerSearchApi, token)
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<Prisoner> {
    try {
      const prisonerData = await this.get<Prisoner>({ path: `/prisoner/${prisonerNumber}` }, this.token)
      return {
        ...prisonerData,
        bookingId: prisonerData.bookingId ? +prisonerData.bookingId : undefined,
      }
    } catch (error) {
      return error
    }
  }

  async locationSearch(prisonId: string, queryParams: PrisonerSearchQueryParams): Promise<PagedList<Prisoner>> {
    const { size, showAll, location, ...query } = queryParams
    const queryString = mapToQueryString({
      ...query,
      page: queryParams.page ? queryParams.page - 1 : 0,
      size: queryParams.showAll ? 99999 : (queryParams.size ?? 50),
      cellLocationPrefix: location,
    })

    try {
      const { content, ...metadata } = await this.get<PrisonerSearchResponse>(
        {
          path: `/prison/${prisonId}/prisoners?${queryString}`,
        },
        this.token,
      )

      return {
        metadata: {
          first: metadata.first,
          last: metadata.last,
          numberOfElements: metadata.numberOfElements,
          offset: metadata.pageable.offset,
          // Prisoner search is 0 based
          pageNumber: metadata.pageable.pageNumber + 1,
          size: metadata.size,
          totalElements: metadata.totalElements,
          totalPages: metadata.totalPages,
        },
        content,
      }
    } catch (error) {
      return error
    }
  }

  async globalSearch(queryParams: GlobalSearchQueryParams, responseFields: string[]): Promise<PagedList<Prisoner>> {
    const { size, ...query } = queryParams
    const queryString = mapToQueryString({
      page: queryParams.page ? queryParams.page - 1 : 0,
      size: size ?? 20,
      responseFields: responseFields ? responseFields.join(',') : null,
    })

    try {
      const { content, ...metadata } = await this.post<PrisonerSearchResponse>(
        {
          path: `/global-search?${queryString}`,
          data: { ...query, includeAliases: true },
        },
        this.token,
      )

      return {
        metadata: {
          first: metadata.first,
          last: metadata.last,
          numberOfElements: metadata.numberOfElements,
          offset: metadata.pageable.offset,
          // Prisoner search is 0 based
          pageNumber: metadata.pageable.pageNumber + 1,
          size: metadata.size,
          totalElements: metadata.totalElements,
          totalPages: metadata.totalPages,
        },
        content,
      }
    } catch (error) {
      return error
    }
  }
}
