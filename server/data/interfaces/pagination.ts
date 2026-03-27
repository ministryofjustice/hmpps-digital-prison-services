export interface Pagination {
  itemDescription: string
  previous: { href: string; text: string }
  next: { href: string; text: string }
  page: number
  offset: number
  pageSize: number
  totalPages: number
  totalElements: number
  elementsOnPage: number
  pages: Page[]
  viewAllUrl?: string
  enableShowAll: boolean
}

export type Page =
  | {
      number: string
      href: string
      current?: boolean
    }
  | { ellipsis: true }
