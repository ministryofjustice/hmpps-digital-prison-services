import { PagedList } from '../../data/interfaces/pagedList'

export const pagedListMock = <T>(content: T[]): PagedList<T> => ({
  content,
  metadata: {
    first: false,
    last: false,
    numberOfElements: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
    offset: 0,
    pageNumber: 0,
  },
})
