import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import LocationService from './locationsService'
import { locationMock } from '../mocks/locationMock'

describe('establishmentRollService', () => {
  let locationRollService: LocationService

  beforeEach(() => {
    locationRollService = new LocationService(() => prisonApiClientMock)
  })

  describe('getLocationInfo', () => {
    it('should call api and return response', async () => {
      prisonApiClientMock.getLocation = jest.fn().mockResolvedValueOnce(locationMock)

      const locationInfo = await locationRollService.getLocationInfo('token', 'loc')

      expect(locationInfo).toEqual(locationMock)
    })
  })
})
