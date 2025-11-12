import { Request } from 'express'
import { sortParamToDirection, nextSortQuery } from './sorting'

describe('sortParamToDirection', () => {
  it.each([
    ['ASC', 'ASC', 'ascending'],
    ['DESC', 'DESC', 'descending'],
    ['Defaults to none (unexpected string)', 'ABCDE', 'none'],
    ['Defaults to none (blank string)', ' ', 'none'],
    ['Defaults to none (empty string)', '', 'none'],
    ['Defaults to none (null)', null, 'none'],
    ['Defaults to none (undefined)', undefined, 'none'],
  ])('%s', (_, input, output) => {
    expect(sortParamToDirection(input)).toEqual(output)
  })
})

describe('nextSortQuery', () => {
  const req = {
    query: {
      one: 'ASC',
      two: 'DESC',
      three: '',
    },
  } as unknown as Request

  it.each([
    ['Property present with value (ASC)', 'one', 'one=DESC'],
    ['Property present with value (DESC)', 'two', 'two=ASC'],
    ['Empty property (default to ASC)', 'three', 'three=ASC'],
    ['Missing property (default to ASC)', 'four', 'four=ASC'],
  ])('%s', (_, input, output) => {
    expect(nextSortQuery(req, input)).toEqual(output)
  })
})
