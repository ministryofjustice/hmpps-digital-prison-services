import { Pagination } from '../data/interfaces/pagination'

export const paginationMock: Pagination = {
  elementsOnPage: 0,
  itemDescription: 'item',
  next: { href: '#', text: 'Next' },
  offset: 0,
  page: 1,
  pageSize: 1,
  pages: [{ href: '#', text: '1', selected: true }],
  previous: { href: '#', text: 'Previous' },
  totalElements: 1,
  totalPages: 1,
}

export default { paginationMock }
