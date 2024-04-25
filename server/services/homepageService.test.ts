import { assignedRollCountMock, unassignedRollCountMock } from '../mocks/rollCountMock'
import { movementsMock } from '../mocks/movementsMock'
import HomepageService from './homepageService'
import { todayDataMock } from '../mocks/todayDataMock'
import KeyWorkerApiRestClient from '../data/keyWorkerApiClient'
import { RestClientBuilder } from '../data'
import { WhereAboutsApiClient } from '../data/interfaces/whereAboutsApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import prisonApiClientMock from '../test/mocks/prisonApiClientMock'

jest.mock('../data/prisonApiClient')

const token = 'some token'
const activeCaseLoadId = 'LEI'

describe('Homepage service', () => {
  let service: HomepageService
  let prisonApiClient: PrisonApiClient
  let whereAboutsApiClient: RestClientBuilder<WhereAboutsApiClient>
  let keyWorkerApiClient: RestClientBuilder<KeyWorkerApiRestClient>

  describe('getTodaySection', () => {
    beforeEach(() => {
      prisonApiClient = {
        ...prisonApiClientMock,
        getRollCount: jest.fn(async ({ unassigned }) => {
          if (unassigned) {
            return unassignedRollCountMock
          }
          return assignedRollCountMock
        }),
      }
      prisonApiClient.getMovements = jest.fn(async prisonId => {
        if (prisonId) return movementsMock
        return movementsMock
      })

      service = new HomepageService(() => prisonApiClient, whereAboutsApiClient, keyWorkerApiClient)
    })

    it('should return today data', async () => {
      const todayData = await service.getTodaySection(token, activeCaseLoadId)

      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith({ prisonId: activeCaseLoadId })
      expect(prisonApiClient.getRollCount).toHaveBeenCalledWith({ prisonId: activeCaseLoadId, unassigned: true })
      expect(prisonApiClient.getMovements).toHaveBeenCalled()
      expect(todayData).toEqual({
        ...todayDataMock,
        todayLastUpdated: expect.stringContaining(new Date().toISOString().slice(0, -5)),
      })
    })

    it('Should add people outside of the living unit to the totals', async () => {
      const assignedRollCountWithLivingUnits = assignedRollCountMock.map(i => ({ ...i, outOfLivingUnits: 10 }))
      const unassignedRollCountWithLivingUnits = unassignedRollCountMock.map(i => ({ ...i, outOfLivingUnits: 10 }))
      prisonApiClient.getRollCount = jest.fn(async ({ unassigned }) => {
        if (unassigned) {
          return unassignedRollCountWithLivingUnits
        }
        return assignedRollCountWithLivingUnits
      })
      const todayData = await service.getTodaySection(token, activeCaseLoadId)
      expect(todayData.unlockRollCount).toEqual(1095)
      expect(todayData.currentPopulationCount).toEqual(1103)
    })
  })
})
