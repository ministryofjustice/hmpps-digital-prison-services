import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import MovementsService from './movementsService'
import prisonerSearchApiClientMock from '../test/mocks/prisonerSearchApiClientMock'
import { movementsInMock } from '../test/mocks/movementsInMock'
import { prisonerSearchMock } from '../test/mocks/prisonerSearchMock'
import { movementsOutMock } from '../test/mocks/movementsOutMock'

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
})
