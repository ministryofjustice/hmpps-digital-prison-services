import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import PrisonerSearchService from './prisonerSearchService'
import { PrisonUser } from '../interfaces/prisonUser'
import { PagedList } from '../data/interfaces/pagedList'
import Prisoner from '../data/interfaces/prisoner'
import { LocationViewModel } from './interfaces/LocationViewModel'

describe('prisonerSearchService', () => {
  let prisonerSearchApi: PrisonerSearchClient
  let service: PrisonerSearchService
  const userLocations: LocationViewModel[] = [
    { value: 'LEI-1', text: 'some desc' },
    { value: 'LEI-2', text: 'some desc' },
    { value: 'LEI-3', text: 'some desc' },
  ]

  beforeEach(() => {
    prisonerSearchApi = {
      globalSearch: jest.fn(),
      getPrisonerDetails: jest.fn(),
      locationSearch: jest.fn(),
    }

    service = new PrisonerSearchService(() => prisonerSearchApi)
  })

  it('Returns the response from the API', async () => {
    prisonerSearchApi.locationSearch = jest.fn(async () => ({ example: true }) as unknown as PagedList<Prisoner>)
    const resp = await service.getResults(
      'clientToken',
      {
        activeCaseLoadId: 'LEI',
        locations: userLocations,
      } as PrisonUser,
      { location: 'LEI', page: 10, sort: 'lastName,asc', term: 'smith', size: 25, showAll: false, alerts: ['ABC'] },
    )
    expect(resp).toEqual({ example: true })
  })

  it('Handles no optional parameters', async () => {
    await service.getResults(
      'clientToken',
      {
        activeCaseLoadId: 'LEI',
        locations: userLocations,
      } as PrisonUser,
      { page: 10, size: 25, showAll: false },
    )
    expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
      'LEI',
      expect.objectContaining({
        page: 10,
        size: 25,
        showAll: false,
      }),
    )
  })

  it('Passes params to the location search', async () => {
    await service.getResults(
      'clientToken',
      {
        activeCaseLoadId: 'LEI',
        locations: userLocations,
      } as PrisonUser,
      { location: 'LEI', page: 10, sort: 'lastName,asc', term: 'smith', size: 25, showAll: false, alerts: ['ABC'] },
    )
    expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
      'LEI',
      expect.objectContaining({
        page: 10,
        sort: 'lastName,asc',
        term: 'smith',
        size: 25,
        showAll: false,
        alerts: ['ABC'],
      }),
    )
  })

  describe('Location parameters', () => {
    it('Removes the location when it matches the active caseload', async () => {
      await service.getResults(
        'clientToken',
        {
          activeCaseLoadId: 'LEI',
          locations: userLocations,
        } as PrisonUser,
        { location: 'LEI', page: 10, sort: 'lastName,asc', term: 'smith', size: 25, showAll: false, alerts: ['ABC'] },
      )
      expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
        'LEI',
        expect.not.objectContaining({
          location: 'LEI',
        }),
      )
    })

    it('Used empty string as location when location is falsey', async () => {
      await service.getResults(
        'clientToken',
        {
          activeCaseLoadId: 'LEI',
          locations: userLocations,
        } as PrisonUser,
        {
          location: undefined,
          page: 10,
          sort: 'lastName,asc',
          term: 'smith',
          size: 25,
          showAll: false,
          alerts: ['ABC'],
        },
      )
      expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
        'LEI',
        expect.objectContaining({
          location: '',
        }),
      )
    })

    it('Keeps the location when it matches one of the users locations which does not have sublocations', async () => {
      await service.getResults(
        'clientToken',
        {
          activeCaseLoadId: 'LEI',
          locations: userLocations,
        } as PrisonUser,
        { location: 'LEI-2', page: 10, sort: 'lastName,asc', term: 'smith', size: 25, showAll: false, alerts: ['ABC'] },
      )
      expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
        'LEI',
        expect.objectContaining({
          location: 'LEI-2-',
        }),
      )
    })
  })
})
