import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import PrisonerSearchService from './prisonerSearchService'
import { PrisonUser } from '../interfaces/prisonUser'
import { Location } from '../data/interfaces/location'
import { PagedList } from '../data/interfaces/pagedList'
import Prisoner from '../data/interfaces/prisoner'

describe('prisonerSearchService', () => {
  let prisonerSearchApi: PrisonerSearchClient
  let service: PrisonerSearchService
  const userLocations: Location[] = [
    { locationPrefix: 'LEI-1', subLocations: true },
    { locationPrefix: 'LEI-2', subLocations: false },
    { locationPrefix: 'LEI-3', subLocations: true },
  ] as Location[]

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
          location: 'LEI-2',
        }),
      )
    })

    it('Adds a - to the end of the location with sublocations', async () => {
      await service.getResults(
        'clientToken',
        {
          activeCaseLoadId: 'LEI',
          locations: userLocations,
        } as PrisonUser,
        { location: 'LEI-1', page: 10, sort: 'lastName,asc', term: 'smith', size: 25, showAll: false, alerts: ['ABC'] },
      )
      expect(prisonerSearchApi.locationSearch).toHaveBeenCalledWith(
        'LEI',
        expect.objectContaining({
          location: 'LEI-1-',
        }),
      )
    })
  })
})
