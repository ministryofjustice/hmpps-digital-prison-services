import nock from 'nock'
import { AuthenticationClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import LocationsInsidePrisonRestApiClient from './locationsInsidePrisonRestApiClient'
import LocationsApiLocation from './interfaces/prisonHierarchyDto'

describe('LocationsInsidePrisonRestApiClient', () => {
  let fakeApi: nock.Scope
  let client: LocationsInsidePrisonRestApiClient
  let authenticationClient: jest.Mocked<AuthenticationClient>

  const username = 'test-user'
  const token = 'system-token'

  beforeEach(() => {
    fakeApi = nock(config.apis.locationsInsidePrisonApi.url)

    authenticationClient = {
      getToken: jest.fn().mockResolvedValue(token),
    } as unknown as jest.Mocked<AuthenticationClient>

    client = new LocationsInsidePrisonRestApiClient(authenticationClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulGet = <T>(url: string, response: T) => {
    fakeApi.get(url).matchHeader('authorization', `Bearer ${token}`).reply(200, response)
  }

  describe('getTopLevelResidentialLocations', () => {
    it('should return data from API', async () => {
      const prisonId = 'MDI'

      const mockResponse: LocationsApiLocation[] = [
        {
          locationType: 'type',
          locationId: '123',
          locationCode: 'A',
          localName: 'Wing A',
          level: 1,
          status: 'ACTIVE',
          fullLocationPath: 'A',
          subLocations: [],
        } as LocationsApiLocation,
      ]

      mockSuccessfulGet(`/locations/prison/${prisonId}/residential-first-level`, mockResponse)

      const result = await client.getTopLevelResidentialLocations(prisonId, username)

      expect(result).toEqual(mockResponse)
      expect(authenticationClient.getToken).toHaveBeenCalled()
    })
  })
})
