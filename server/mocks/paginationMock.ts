import { Pagination } from '../data/interfaces/pagination'

export const paginationMock: Pagination = {
  elementsOnPage: 0,
  itemDescription: 'item',
  next: { href: '#', text: 'Next' },
  offset: 0,
  page: 1,
  pageSize: 1,
  pages: [{ href: '#', number: '1', current: true }],
  previous: { href: '#', text: 'Previous' },
  totalElements: 1,
  totalPages: 1,
  enableShowAll: false,
}

export default { paginationMock }
