import EstablishmentRollService from './establishmentRollService'
import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import { assignedRollCountMock, unassignedRollCountMock } from '../mocks/rollCountMock'

describe('establishmentRollService', () => {
  let establishmentRollService: EstablishmentRollService

  beforeEach(() => {
    establishmentRollService = new EstablishmentRollService(() => prisonApiClientMock)
    prisonApiClientMock.getRollCount = jest
      .fn()
      .mockResolvedValueOnce(assignedRollCountMock)
      .mockResolvedValueOnce(unassignedRollCountMock)
    prisonApiClientMock.getMovements = jest.fn().mockResolvedValue({ in: 4, out: 5 })
    prisonApiClientMock.getEnrouteRollCount = jest.fn().mockResolvedValue(3)
    prisonApiClientMock.getLocationsForPrison = jest.fn().mockResolvedValue([])
    prisonApiClientMock.getAttributesForLocation = jest.fn().mockResolvedValue({ noOfOccupants: 31 })
  })

  it('should return establishment roll counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.assignedRollBlocksCounts).toEqual(assignedRollCountMock)
  })

  it('should calculate unlock roll', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.unlockRoll).toEqual(1024)
  })

  it('should return inToday', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.inToday).toEqual(4)
  })

  it('should return outToday', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.inToday).toEqual(4)
  })

  it('should return unassignedIn by summing currentlyInCell, outOfLivingUnits from unassigned roll call', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.unassignedIn).toEqual(23)
  })

  it('should return currentRoll by summing currentlyInCell, outOfLivingUnits an unassignedIn', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.currentRoll).toEqual(1023)
  })

  it('should return enroute count from api', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.enroute).toEqual(3)
  })

  it('should return 0 for noCellAllocated if no CSWAP locations', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.noCellAllocated).toEqual(0)
  })

  it('should call api for noCellAllocated if CSWAP location', async () => {
    prisonApiClientMock.getLocationsForPrison = jest.fn().mockResolvedValue([{ description: 'CSWAP', locationId: 1 }])
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.noCellAllocated).toEqual(31)
  })

  it('should return total of currentlyOut from assigned counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.totalCurrentlyOut).toEqual(5)
  })

  it('should return total of bedsInUse from assigned counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.bedsInUse).toEqual(332)
  })

  it('should return total of currentlyInCell from assigned counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.currentlyInCell).toEqual(1000)
  })

  it('should return total of netVacancies from assigned counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.netVacancies).toEqual(-20)
  })

  it('should return total of outOfOrder from assigned counts', async () => {
    const establishmentRollCounts = await establishmentRollService.getEstablishmentRollCounts('token', 'LEI')

    expect(establishmentRollCounts.todayStats.outOfOrder).toEqual(0)
  })
})
