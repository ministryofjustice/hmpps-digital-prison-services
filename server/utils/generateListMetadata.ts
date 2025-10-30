import { PagedList } from '../data/interfaces/pagedList'
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
}

export interface PrisonerSearchQueryParams extends PagedListQueryParams {
  term?: string
  alerts?: string[]
  location?: string
  cellLocationPrefix?: string
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

export interface SortOption {
  value: string
  description: string
}

export interface SortParams {
  id: string
  label: string
  options: SortOption[]
  sort: string
  queryParams: QueryParams
}

export interface ListMetadata<TGeneric> {
  filtering: {
    queryParams?: { [key: string]: string | number | boolean }
  } & TGeneric
  sorting?: SortParams
  pagination: {
    itemDescription: string
    previous: { href: string; text: string }
    next: { href: string; text: string }
    page: number
    offset: number
    pageSize: number
    totalPages: number
    totalElements: number
    elementsOnPage: number
    pages: { href: string; text: string; selected: boolean; type?: string }[]
    viewAllUrl?: string
  }
}

/**
 * Generate metadata for list pages, including pagination, sorting, filtering
 *
 * For the current page and pages array, the value is incremented by 1 as the API uses a zero based array
 * but users expect page numbers in url, etc to be one based.
 *
 * @param pagedList
 * @param queryParams
 * @param itemDescription
 * @param sortOptions
 * @param sortLabel
 * @param enableShowAll
 */
export const generateListMetadata = <T extends PagedListQueryParams>(
  pagedList: PagedList<PagedListItem>,
  queryParams: T,
  itemDescription: string,
  sortOptions?: SortOption[],
  sortLabel?: string,
  enableShowAll?: boolean,
): ListMetadata<T> => {
  const query = mapToQueryString(queryParams)
  const currentPage = pagedList?.metadata ? pagedList.metadata.pageNumber : undefined

  let pages = []

  if (pagedList?.metadata.totalPages > 1 && pagedList?.metadata.totalPages < 8) {
    pages = [...Array(pagedList.metadata.totalPages).keys()].map(page => {
      return {
        text: `${page + 1}`,
        href: [`?page=${page + 1}`, query].filter(Boolean).join('&'),
        selected: currentPage === page + 1,
      }
    })
  } else if (pagedList?.metadata.totalPages > 7) {
    pages.push({
      text: '1',
      href: [`?page=1`, query].filter(Boolean).join('&'),
      selected: currentPage === 1,
    })

    const pageRange = [currentPage - 1, currentPage, currentPage + 1]
    let preDots = false
    let postDots = false
    // eslint-disable-next-line no-plusplus
    for (let i = 2; i < pagedList.metadata.totalPages; i++) {
      if (pageRange.includes(i)) {
        pages.push({
          text: `${i}`,
          href: [`?page=${i}`, query].filter(Boolean).join('&'),
          selected: currentPage === i,
        })
      } else if (i < pageRange[0] && !preDots) {
        pages.push({
          text: '...',
          type: 'dots',
        })
        preDots = true
      } else if (i > pageRange[2] && !postDots) {
        pages.push({
          text: '...',
          type: 'dots',
        })
        postDots = true
      }
    }

    pages.push({
      text: `${pagedList.metadata.totalPages}`,
      href: [`?page=${pagedList.metadata.totalPages}`, query].filter(Boolean).join('&'),
      selected: currentPage === pagedList.metadata.totalPages,
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

  const viewAllUrl = [`?${mapToQueryString(queryParams)}`, 'showAll=true'].filter(Boolean).join('&')

  return <ListMetadata<T>>{
    filtering: {
      ...queryParams,
      queryParams: { sort: queryParams.sort },
    },
    sorting:
      sortOptions && sortLabel
        ? {
            id: 'sort',
            label: sortLabel,
            options: sortOptions,
            sort: queryParams.sort,
            queryParams: {
              ...queryParams,
              sort: undefined,
            },
          }
        : null,
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
      enableShowAll: enableShowAll === undefined ? false : enableShowAll,
    },
  }
}
