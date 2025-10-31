import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import GlobalSearchService from './globalSearchService'
import Prisoner from '../data/interfaces/prisoner'
import { PagedList } from '../data/interfaces/pagedList'

describe('GlobalSearchService', () => {
  let prisonerSearchApi: PrisonerSearchClient
  let service: GlobalSearchService

  beforeEach(() => {
    prisonerSearchApi = {
      globalSearch: jest.fn(),
      getPrisonerDetails: jest.fn(),
      locationSearch: jest.fn(),
    }

    service = new GlobalSearchService(() => prisonerSearchApi)
  })

  it('Returns the response from the API', async () => {
    prisonerSearchApi.globalSearch = jest.fn(async () => ({ example: true }) as unknown as PagedList<Prisoner>)
    const resp = await service.getResultsForUser('clientToken', { searchTerm: 'A1234BC' })
    expect(resp).toEqual({ example: true })
  })

  describe('Identifier search', () => {
    it('Searches by an identifier when the text has a number in', async () => {
      await service.getResultsForUser('clientToken', { searchTerm: 'A1234BC' })
      expect(prisonerSearchApi.globalSearch).toHaveBeenCalledWith(
        expect.objectContaining({ prisonerIdentifier: 'A1234BC' }),
        expect.anything(),
      )
    })
  })

  describe('Name search', () => {
    it.each([
      ['last name only', { searchTerm: 'smith', expectedSearch: { lastName: 'smith' } }],
      ['last name first name', { searchTerm: 'smith jane', expectedSearch: { firstName: 'jane', lastName: 'smith' } }],
      ['three terms', { searchTerm: 'smith jane extra', expectedSearch: { firstName: 'jane', lastName: 'smith' } }],
      ['last,first', { searchTerm: 'smith,jane', expectedSearch: { firstName: 'jane', lastName: 'smith' } }],
      ['last       first', { searchTerm: 'smith,jane', expectedSearch: { firstName: 'jane', lastName: 'smith' } }],
      [
        'last       first       ',
        { searchTerm: 'smith      ,jane      ', expectedSearch: { firstName: 'jane', lastName: 'smith' } },
      ],
    ])('%s', async (_, { searchTerm, expectedSearch }) => {
      await service.getResultsForUser('clientToken', { searchTerm })
      expect(prisonerSearchApi.globalSearch).toHaveBeenCalledWith(
        expect.objectContaining(expectedSearch),
        expect.anything(),
      )
    })
  })

  describe('Searching with additional params', () => {
    it('Searches with the provided params', async () => {
      await service.getResultsForUser('clientToken', {
        searchTerm: 'A1234BC',
        page: 1,
        gender: 'ALL',
        location: 'IN',
        dateOfBirth: '2000-01-01',
      })

      expect(prisonerSearchApi.globalSearch).toHaveBeenCalledWith(
        { prisonerIdentifier: 'A1234BC', page: 1, gender: 'ALL', location: 'IN', dateOfBirth: '2000-01-01' },
        expect.anything(),
      )
    })
  })
})
