import { PagedList } from '../data/interfaces/pagedList'
import { generateListMetadata, QueryParams } from './generateListMetadata'

const mockPagedData = <T>(content: T[], options?: { totalPages?: number; pageNumber?: number }): PagedList<T> => ({
  content,
  metadata: {
    first: (options?.pageNumber ?? 1) === 1,
    last: (options?.pageNumber ?? 1) === (options?.totalPages ?? 1),
    numberOfElements: content.length,
    offset: 0,
    pageNumber: options?.pageNumber ?? 1,
    size: content.length,
    totalElements: content.length,
    totalPages: options?.totalPages ?? 1,
  },
})

describe('generateListMetadata', () => {
  it('Can handle 0 pages', () => {
    const res = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 0 }), { example: 'foo' }, 'items')
    expect(res.pagination.pages).toEqual([])
  })

  it('Can handle a single page', () => {
    const res = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 1 }), { example: 'foo' }, 'items')
    expect(res.pagination.pages).toEqual([])
  })

  it('Can handle multiple pages that would not require elipses', () => {
    const res = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 3 }), { example: 'foo' }, 'items')
    expect(res.pagination.pages).toEqual([
      { href: '?page=1&example=foo', selected: true, text: '1' },
      { href: '?page=2&example=foo', selected: false, text: '2' },
      { href: '?page=3&example=foo', selected: false, text: '3' },
    ])
  })

  it('Can handle multiple pages that would require elipses at the end', () => {
    const res = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 10 }), { example: 'foo' }, 'items')
    expect(res.pagination.next).toEqual({ href: '?page=2&example=foo', text: 'Next' })
    expect(res.pagination.previous).toBeUndefined()
    expect(res.pagination.pages).toEqual([
      { href: '?page=1&example=foo', selected: true, text: '1' },
      { href: '?page=2&example=foo', selected: false, text: '2' },
      { text: '...', type: 'dots' },
      { href: '?page=10&example=foo', selected: false, text: '10' },
    ])
  })

  it('Can handle multiple pages that would require elipses at the start', () => {
    const res = generateListMetadata<QueryParams>(
      mockPagedData([], { pageNumber: 10, totalPages: 10 }),
      { example: 'foo' },
      'items',
    )
    expect(res.pagination.next).toBeUndefined()
    expect(res.pagination.previous).toEqual({ href: '?page=9&example=foo', text: 'Previous' })
    expect(res.pagination.pages).toEqual([
      { href: '?page=1&example=foo', selected: false, text: '1' },
      { text: '...', type: 'dots' },
      { href: '?page=9&example=foo', selected: false, text: '9' },
      { href: '?page=10&example=foo', selected: true, text: '10' },
    ])
  })

  it('Can handle multiple pages that would require elipses surrounding the current', () => {
    const res = generateListMetadata<QueryParams>(
      mockPagedData([], { pageNumber: 5, totalPages: 10 }),
      { example: 'foo' },
      'items',
    )
    expect(res.pagination.next).toEqual({ href: '?page=6&example=foo', text: 'Next' })
    expect(res.pagination.previous).toEqual({ href: '?page=4&example=foo', text: 'Previous' })
    expect(res.pagination.pages).toEqual([
      { href: '?page=1&example=foo', selected: false, text: '1' },
      { text: '...', type: 'dots' },
      { href: '?page=4&example=foo', selected: false, text: '4' },
      { href: '?page=5&example=foo', selected: true, text: '5' },
      { href: '?page=6&example=foo', selected: false, text: '6' },
      { text: '...', type: 'dots' },
      { href: '?page=10&example=foo', selected: false, text: '10' },
    ])
  })
})
