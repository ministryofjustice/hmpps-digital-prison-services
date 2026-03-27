import type { PagedList } from '../data/interfaces/pagedList'
import type { Pagination, Page } from '../data/interfaces/pagination'
import { mapToQueryString } from './utils'

export type QueryParamValue = string | number | boolean
export type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>
export interface PagedListQueryParams extends QueryParams {
  page?: number
  size?: number
  sort?: string
  showAll?: boolean
}

export interface DietaryRequirementsQueryParams extends PagedListQueryParams {
  nameAndNumber?: string
  location?: string
  foodAllergies?: string[]
  medicalDiet?: string[]
  personalDiet?: string[]
  topLocationLevel?: string[]
  recentArrival?: boolean
}

export interface PrisonerSearchQueryParams extends PagedListQueryParams {
  location?: string
  term?: string
  alerts?: string[]
  cellLocationPrefix?: string
  view?: string
}

// These are the frontend names for the query params used on the global search page
export interface GlobalSearchFilterParams extends PagedListQueryParams {
  searchText?: string
  genderFilter?: 'ALL' | 'M' | 'F' | 'NK' | 'NS'
  locationFilter?: 'ALL' | 'IN' | 'OUT'
  dobDay: string
  dobMonth: string
  dobYear: string
}

export interface GlobalSearchQueryParams extends PagedListQueryParams {
  prisonerIdentifier?: string
  firstName?: string
  lastName?: string
  gender?: 'ALL' | 'M' | 'F' | 'NK' | 'NS'
  location?: 'ALL' | 'IN' | 'OUT'
  dateOfBirth?: string
  includeAliases?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PagedListItem {
  // Extended by:
  // Dietary Requirement
}

export interface ListMetadata<TGeneric> {
  filtering: {
    queryParams?: { [key: string]: string | number | boolean }
  } & TGeneric
  pagination: Pagination
}

/**
 * Generate metadata for list pages, including pagination and filtering
 *
 * For the current page and pages array, the value is incremented by 1 as the API uses a zero based array
 * but users expect page numbers in url, etc to be one based.
 *
 * @param pagedList
 * @param queryParams
 * @param itemDescription
 * @param enableShowAll
 */
export const generateListMetadata = <T extends PagedListQueryParams>(
  pagedList: PagedList<PagedListItem>,
  queryParams: T,
  itemDescription: string,
  enableShowAll: boolean = false,
): ListMetadata<T> => {
  const query = mapToQueryString(queryParams)
  const currentPage = pagedList?.metadata ? pagedList.metadata.pageNumber : undefined

  let pages: Page[] = []

  if (pagedList?.metadata.totalPages > 1 && pagedList?.metadata.totalPages < 8) {
    pages = Array.from({ length: pagedList.metadata.totalPages }, (_, page) => {
      return {
        number: `${page + 1}`,
        href: [`?page=${page + 1}`, query].filter(Boolean).join('&'),
        current: currentPage === page + 1,
      }
    })
  } else if (pagedList?.metadata.totalPages > 7) {
    pages.push({
      number: '1',
      href: [`?page=1`, query].filter(Boolean).join('&'),
      current: currentPage === 1,
    })

    const pageRange = [currentPage - 1, currentPage, currentPage + 1]
    let preDots = false
    let postDots = false
    // eslint-disable-next-line no-plusplus
    for (let i = 2; i < pagedList.metadata.totalPages; i++) {
      if (pageRange.includes(i)) {
        pages.push({
          number: `${i}`,
          href: [`?page=${i}`, query].filter(Boolean).join('&'),
          current: currentPage === i,
        })
      } else if (i < pageRange[0] && !preDots) {
        pages.push({ ellipsis: true })
        preDots = true
      } else if (i > pageRange[2] && !postDots) {
        pages.push({ ellipsis: true })
        postDots = true
      }
    }

    pages.push({
      number: `${pagedList.metadata.totalPages}`,
      href: [`?page=${pagedList.metadata.totalPages}`, query].filter(Boolean).join('&'),
      current: currentPage === pagedList.metadata.totalPages,
    })
  }

  const next = pagedList?.metadata.last
    ? undefined
    : {
        href: [`?page=${currentPage + 1}`, query].filter(Boolean).join('&'),
        text: 'Next',
      }

  const previous = pagedList?.metadata.first
    ? undefined
    : {
        href: [`?page=${currentPage - 1}`, query].filter(Boolean).join('&'),
        text: 'Previous',
      }

  const viewAllUrl = ['?showAll=true', query].filter(Boolean).join('&')

  return <ListMetadata<T>>{
    filtering: {
      ...queryParams,
      queryParams: { sort: queryParams.sort },
    },
    pagination: {
      itemDescription,
      previous,
      next,
      page: currentPage,
      offset: pagedList?.metadata?.offset,
      pageSize: pagedList?.metadata.size,
      totalPages: pagedList?.metadata.totalPages,
      totalElements: pagedList?.metadata.totalElements,
      elementsOnPage: pagedList?.metadata.numberOfElements,
      pages,
      viewAllUrl,
      enableShowAll,
    },
  }
}
