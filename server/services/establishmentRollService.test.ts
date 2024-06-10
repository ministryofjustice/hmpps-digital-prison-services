import EstablishmentRollService from './establishmentRollService'
import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import { assignedRollCountWithSpursMock } from '../mocks/rollCountMock'
import { prisonRollCountMock } from '../mocks/prisonRollCountMock'

describe('establishmentRollService', () => {
  let establishmentRollService: EstablishmentRollService

  beforeEach(() => {
    establishmentRollService = new EstablishmentRollService(() => prisonApiClientMock)
  })

  describe('getEstablishmentRollCounts', () => {
    beforeEach(() => {
      prisonApiClientMock.getPrisonRollCount = jest.fn().mockResolvedValueOnce(prisonRollCountMock)
    })

    it('should return data from API for the today stats', async () => {
      const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

      expect(establishmentRollCounts.todayStats).toEqual({
        currentRoll: 200,
        enroute: 500,
        inToday: 300,
        noCellAllocated: 700,
        outToday: 600,
        unassignedIn: 400,
        unlockRoll: 100,
      })
    })

    it('should return data from API for the total stats', async () => {
      const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

      expect(establishmentRollCounts.totals).toEqual({
        bedsInUse: 10,
        currentlyInCell: 20,
        currentlyOut: 30,
        netVacancies: 50,
        outOfOrder: 60,
        workingCapacity: 40,
      })
    })

    it('should return wing data from API', async () => {
      const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

      expect(establishmentRollCounts.wings).toEqual(prisonRollCountMock.locations)
    })
  })

  describe('getLandingRollCounts', () => {
    it('should call api and return response', async () => {
      prisonApiClientMock.getRollCount = jest.fn().mockResolvedValueOnce(assignedRollCountWithSpursMock)

      const landingRollCounts = await establishmentRollService.getLandingRollCounts('token', 'LEI', 123)
      expect(prisonApiClientMock.getRollCount).toBeCalledWith('LEI', {
        wingOnly: false,
        showCells: true,
        parentLocationId: 123,
      })

      expect(landingRollCounts).toEqual(assignedRollCountWithSpursMock)
    })
  })
})
