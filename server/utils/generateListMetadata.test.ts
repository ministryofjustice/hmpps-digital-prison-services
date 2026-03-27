import type { PagedList } from '../data/interfaces/pagedList'
import { generateListMetadata, type QueryParams } from './generateListMetadata'

const mockPagedData = <T>(content: T[], options?: { totalPages?: number; pageNumber?: number }): PagedList<T> => ({
  content,
  metadata: {
    first: (options?.pageNumber ?? 1) === 1,
    last: options?.totalPages === 0 || (options?.pageNumber ?? 1) === (options?.totalPages ?? 1),
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
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { totalPages: 0 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.itemDescription).toEqual('item')
    expect(listMetadata.pagination.previous).toBeUndefined()
    expect(listMetadata.pagination.next).toBeUndefined()
    expect(listMetadata.pagination.pages).toEqual([])
    expect(listMetadata.pagination.viewAllUrl).toEqual('?showAll=true&example=foo')
    expect(listMetadata.pagination.enableShowAll).toBe(false)
  })

  it('Can handle a single page', () => {
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { totalPages: 1 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.previous).toBeUndefined()
    expect(listMetadata.pagination.next).toBeUndefined()
    expect(listMetadata.pagination.pages).toEqual([])
    expect(listMetadata.pagination.viewAllUrl).toEqual('?showAll=true&example=foo')
    expect(listMetadata.pagination.enableShowAll).toBe(false)
  })

  it('Can handle multiple pages that would not require elipses', () => {
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { totalPages: 3 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.pages).toEqual([
      { href: '?page=1&example=foo', current: true, number: '1' },
      { href: '?page=2&example=foo', current: false, number: '2' },
      { href: '?page=3&example=foo', current: false, number: '3' },
    ])
  })

  it('Can handle multiple pages that would require elipses at the end', () => {
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { totalPages: 10 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.next).toEqual({ href: '?page=2&example=foo', text: 'Next' })
    expect(listMetadata.pagination.previous).toBeUndefined()
    expect(listMetadata.pagination.pages).toEqual([
      { href: '?page=1&example=foo', current: true, number: '1' },
      { href: '?page=2&example=foo', current: false, number: '2' },
      { ellipsis: true },
      { href: '?page=10&example=foo', current: false, number: '10' },
    ])
  })

  it('Can handle multiple pages that would require elipses at the start', () => {
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { pageNumber: 10, totalPages: 10 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.next).toBeUndefined()
    expect(listMetadata.pagination.previous).toEqual({ href: '?page=9&example=foo', text: 'Previous' })
    expect(listMetadata.pagination.pages).toEqual([
      { href: '?page=1&example=foo', current: false, number: '1' },
      { ellipsis: true },
      { href: '?page=9&example=foo', current: false, number: '9' },
      { href: '?page=10&example=foo', current: true, number: '10' },
    ])
  })

  it('Can handle multiple pages that would require elipses surrounding the current', () => {
    const listMetadata = generateListMetadata<QueryParams>(
      mockPagedData([], { pageNumber: 5, totalPages: 10 }),
      { example: 'foo' },
      'item',
    )
    expect(listMetadata.pagination.next).toEqual({ href: '?page=6&example=foo', text: 'Next' })
    expect(listMetadata.pagination.previous).toEqual({ href: '?page=4&example=foo', text: 'Previous' })
    expect(listMetadata.pagination.pages).toEqual([
      { href: '?page=1&example=foo', current: false, number: '1' },
      { ellipsis: true },
      { href: '?page=4&example=foo', current: false, number: '4' },
      { href: '?page=5&example=foo', current: true, number: '5' },
      { href: '?page=6&example=foo', current: false, number: '6' },
      { ellipsis: true },
      { href: '?page=10&example=foo', current: false, number: '10' },
    ])
  })

  it.each([
    { scenario: 'with empty query params', queryParams: {}, expectedSort: undefined },
    {
      scenario: 'with sort query param provided',
      queryParams: { sort: 'dateCreated,DESC' },
      expectedSort: 'dateCreated,DESC',
    },
    {
      scenario: 'with several query params provided',
      queryParams: { sort: 'dateCreated,DESC', from: '01/01/2023' },
      expectedSort: 'dateCreated,DESC',
    },
  ])('Can handle setting filtering options $scenario', ({ queryParams, expectedSort }) => {
    const listMetadata = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 0 }), queryParams, 'alert')
    expect(listMetadata.filtering).toEqual({
      ...queryParams,
      queryParams: { sort: expectedSort },
    })
  })

  it('Can enable “Show all”', () => {
    const listMetadata = generateListMetadata<QueryParams>(mockPagedData([], { totalPages: 0 }), {}, 'alert', true)
    expect(listMetadata.pagination.enableShowAll).toBe(true)
  })
})
