import PrisonApiRestClient from '../data/prisonApiClient'
import { assignedRollCountMock, unassignedRollCountMock } from '../mocks/rollCountMock'
import { movementsMock } from '../mocks/movementsMock'
import HomepageService from './homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import { formatDateTimeISO } from '../utils/dateHelpers'

jest.mock('../data/prisonApiClient')

const token = 'some token'
const activeCaseLoadId = 'LEI'

describe('Homepage service', () => {
  let service: HomepageService
  let prisonApiClient: jest.Mocked<PrisonApiRestClient>

  describe('getTodaySection', () => {
    beforeEach(() => {
      prisonApiClient = new PrisonApiRestClient(null) as jest.Mocked<PrisonApiRestClient>

      prisonApiClient.getRollCount = jest.fn(async (prisonId, unassigned) => {
        if (unassigned) {
          return unassignedRollCountMock
        }
        return assignedRollCountMock
      })
      prisonApiClient.getMovements = jest.fn(async prisonId => {
        return movementsMock
      })

      service = new HomepageService(() => prisonApiClient)
    })

    it('should return today data', async () => {
      const todayData = await service.getTodaySection(token, activeCaseLoadId)

      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith(activeCaseLoadId)
      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith(activeCaseLoadId, true)
      expect(prisonApiClient.getMovements).toHaveBeenCalled()
      expect(todayData).toEqual({ ...todayDataMock, todayLastUpdated: formatDateTimeISO(new Date()) })
    })
  })
})
