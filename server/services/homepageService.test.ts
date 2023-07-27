import PrisonApiRestClient from '../data/prisonApiClient'
import { assignedRollCountMock, unassignedRollCountMock } from '../mocks/rollCountMock'
import { movementsMock } from '../mocks/movementsMock'
import HomepageService from './homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import WhereAboutsApiRestClient from '../data/whereAboutsApiClient'
import { KeyWorkerApiClient } from '../data/interfaces/keyWorkerApiClient'
import KeyWorkerApiRestClient from '../data/keyWorkerApiClient'
import { RestClientBuilder } from '../data'
import { WhereAboutsApiClient } from '../data/interfaces/whereAboutsApiClient'

jest.mock('../data/prisonApiClient')

const token = 'some token'
const activeCaseLoadId = 'LEI'

describe('Homepage service', () => {
  let service: HomepageService
  let prisonApiClient: jest.Mocked<PrisonApiRestClient>
  let whereAboutsApiClient: RestClientBuilder<WhereAboutsApiClient>
  let keyWorkerApiClient: RestClientBuilder<KeyWorkerApiRestClient>

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
        if (prisonId) return movementsMock
        return movementsMock
      })

      service = new HomepageService(() => prisonApiClient, whereAboutsApiClient, keyWorkerApiClient)
    })

    it('should return today data', async () => {
      const todayData = await service.getTodaySection(token, activeCaseLoadId)

      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith(activeCaseLoadId)
      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith(activeCaseLoadId, true)
      expect(prisonApiClient.getMovements).toHaveBeenCalled()
      expect(todayData).toEqual({
        ...todayDataMock,
        todayLastUpdated: expect.stringContaining(new Date().toISOString().slice(0, -5)),
      })
    })
  })
})
