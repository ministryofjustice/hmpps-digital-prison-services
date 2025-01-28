export interface PagedList<T> {
  content: T[]
  metadata: {
    first: boolean
    last: boolean
    numberOfElements: number
    offset: number
    pageNumber: number
    size: number
    totalElements: number
    totalPages: number
  }
}
