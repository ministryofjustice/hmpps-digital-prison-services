import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import MovementsService from './movementsService'
import prisonerSearchApiClientMock from '../test/mocks/prisonerSearchApiClientMock'
import { movementsInMock } from '../test/mocks/movementsInMock'
import { prisonerSearchMock } from '../test/mocks/prisonerSearchMock'
import { movementsOutMock } from '../test/mocks/movementsOutMock'
import { movementsEnRouteMock } from '../test/mocks/movementsEnRouteMock'
import { movementsInReceptionMock } from '../test/mocks/movementsInReceptionMock'
import { movementsRecentMock } from '../test/mocks/movementsRecentMock'
import { offenderCellHistory2Mock, offenderCellHistoryMock } from '../test/mocks/offenderCellHistoryMock'
import { userDetailsMock } from '../test/mocks/userDetailsMock'
import { pagedListMock } from '../test/mocks/pagedListMock'

describe('movementsService', () => {
  let movementsService: MovementsService

  beforeEach(() => {
    movementsService = new MovementsService(
      () => prisonApiClientMock,
      () => prisonerSearchApiClientMock,
    )
  })

  describe('getArrivedTodayPrisoners', () => {
    it('should return prisoners returned from movements api', async () => {
      prisonApiClientMock.getMovementsIn = jest.fn().mockResolvedValue(movementsInMock)
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getArrivedTodayPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toHaveBeenCalledWith(['A1234AA', 'A1234AB'])

      expect(result).toEqual([
        {
          ...prisonerSearchMock[0],
          alertFlags: [],
          arrivedFrom: 'Cookham Wood',
          movementTime: '10:30:00',
        },
        {
          ...prisonerSearchMock[1],
          alertFlags: [
            {
              alertCodes: ['HID'],
              alertIds: ['HID'],
              classes: 'alert-status alert-status--medical',
              label: 'Hidden disability',
            },
          ],
          arrivedFrom: 'Leeds',
          movementTime: '10:00:00',
        },
      ])
    })

    it('should return empty api if no incoming prisoners', async () => {
      prisonApiClientMock.getMovementsIn = jest.fn().mockResolvedValue([])
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getArrivedTodayPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toBeCalledTimes(0)

      expect(result).toEqual([])
    })
  })

  describe('getOutTodayPrisoners', () => {
    it('should return prisoners from movements api', async () => {
      prisonApiClientMock.getMovementsOut = jest.fn().mockResolvedValue(movementsOutMock)
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getOutTodayPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toHaveBeenCalledWith(['A1234AA', 'A1234AB'])

      expect(result).toEqual([
        {
          ...prisonerSearchMock[0],
          alertFlags: [],
          reasonDescription: 'Another transfer',
          timeOut: '11:00:00',
        },
        {
          ...prisonerSearchMock[1],
          alertFlags: [
            {
              alertCodes: ['HID'],
              alertIds: ['HID'],
              classes: 'alert-status alert-status--medical',
              label: 'Hidden disability',
            },
          ],
          reasonDescription: 'Transfer',
          timeOut: '10:00:00',
        },
      ])
    })

    it('should return empty api if no incoming prisoners', async () => {
      prisonApiClientMock.getMovementsOut = jest.fn().mockResolvedValue([])
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getOutTodayPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toBeCalledTimes(0)

      expect(result).toEqual([])
    })
  })

  describe('getEnRoutePrisoners', () => {
    it('should return prisoners from movements api', async () => {
      prisonApiClientMock.getMovementsEnRoute = jest.fn().mockResolvedValue(movementsEnRouteMock)
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getEnRoutePrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toHaveBeenCalledWith(['A1234AA', 'A1234AB'])

      expect(result).toEqual([
        {
          ...prisonerSearchMock[0],
          from: 'Leeds',
          reason: 'Normal Transfer',
          alertFlags: [],
          movementTime: '11:00',
          movementDate: '2023-12-25',
        },
        {
          ...prisonerSearchMock[1],
          alertFlags: [
            {
              alertCodes: ['HID'],
              alertIds: ['HID'],
              classes: 'alert-status alert-status--medical',
              label: 'Hidden disability',
            },
          ],
          from: 'Leeds',
          reason: 'Normal Transfer',
          movementDate: '2023-12-25',
          movementTime: '10:00',
        },
      ])
    })

    it('should return empty api if no incoming prisoners', async () => {
      prisonApiClientMock.getMovementsEnRoute = jest.fn().mockResolvedValue([])
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)

      const result = await movementsService.getEnRoutePrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toBeCalledTimes(0)

      expect(result).toEqual([])
    })
  })

  describe('getInReceptionPrisoners', () => {
    it('should return prisoners from movements api', async () => {
      prisonApiClientMock.getMovementsInReception = jest.fn().mockResolvedValue(movementsInReceptionMock)
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)
      prisonApiClientMock.getRecentMovements = jest.fn().mockResolvedValue(movementsRecentMock)

      const result = await movementsService.getInReceptionPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toHaveBeenCalledWith(['A1234AA', 'A1234AB'])
      expect(prisonApiClientMock.getRecentMovements).toHaveBeenCalledWith(['A1234AA', 'A1234AB'])

      expect(result).toEqual([
        {
          ...prisonerSearchMock[0],
          from: 'Leeds',
          timeArrived: '11:00',
          alertFlags: [],
        },
        {
          ...prisonerSearchMock[1],
          alertFlags: [
            {
              alertCodes: ['HID'],
              alertIds: ['HID'],
              classes: 'alert-status alert-status--medical',
              label: 'Hidden disability',
            },
          ],
          from: 'Leicester',
          timeArrived: '10:00',
        },
      ])
    })

    it('should return empty api if no incoming prisoners', async () => {
      prisonApiClientMock.getMovementsInReception = jest.fn().mockResolvedValue([])
      prisonerSearchApiClientMock.getPrisonersById = jest.fn().mockResolvedValue(prisonerSearchMock)
      prisonApiClientMock.getRecentMovements = jest.fn().mockResolvedValue(movementsRecentMock)

      const result = await movementsService.getInReceptionPrisoners('token', 'LEI')
      expect(prisonerSearchApiClientMock.getPrisonersById).toBeCalledTimes(0)
      expect(prisonApiClientMock.getRecentMovements).toBeCalledTimes(0)

      expect(result).toEqual([])
    })
  })

  describe('getNoCellAllocatedPrisoners', () => {
    it('should search for prisoners with CSWAP living unit and embellish with movements', async () => {
      prisonerSearchApiClientMock.getCswapPrisonersInEstablishment = jest
        .fn()
        .mockResolvedValue(pagedListMock(prisonerSearchMock))

      prisonApiClientMock.getOffenderCellHistory = jest
        .fn()
        .mockResolvedValueOnce(pagedListMock(offenderCellHistoryMock))
        .mockResolvedValueOnce(pagedListMock(offenderCellHistory2Mock))
      prisonApiClientMock.getUserDetailsList = jest.fn().mockResolvedValue(userDetailsMock)

      const result = await movementsService.getNoCellAllocatedPrisoners('token', 'MDI')
      expect(prisonApiClientMock.getOffenderCellHistory).toHaveBeenCalledTimes(2)
      expect(prisonApiClientMock.getOffenderCellHistory).toHaveBeenCalledWith(123)
      expect(prisonApiClientMock.getOffenderCellHistory).toHaveBeenCalledWith(456)
      expect(prisonApiClientMock.getUserDetailsList).toHaveBeenCalledWith(['ESHANNON', 'CWADDLE'])

      expect(result).toEqual([
        {
          ...prisonerSearchMock[0],
          movedBy: 'Edwin Shannon',
          previousCell: '1-1-2',
          timeOut: '2021-01-01T00:00:00',
        },
        {
          ...prisonerSearchMock[1],
          movedBy: 'Chris Waddle',
          previousCell: '2-1-3',
          timeOut: '2021-01-01T00:00:00',
        },
      ])
    })

    it('should return empty api if no CSWAP prisoners', async () => {
      prisonerSearchApiClientMock.getCswapPrisonersInEstablishment = jest.fn().mockResolvedValue({ content: [] })

      prisonApiClientMock.getOffenderCellHistory = jest.fn().mockResolvedValue(offenderCellHistoryMock)
      prisonApiClientMock.getUserDetailsList = jest.fn().mockResolvedValue(userDetailsMock)

      const result = await movementsService.getNoCellAllocatedPrisoners('token', 'LEI')
      expect(prisonApiClientMock.getOffenderCellHistory).toBeCalledTimes(0)
      expect(prisonApiClientMock.getUserDetailsList).toBeCalledTimes(0)

      expect(result).toEqual([])
    })
  })
})
