import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import MovementsService from './movementsService'
import prisonerSearchApiClientMock from '../test/mocks/prisonerSearchApiClientMock'
import { movementsInMock } from '../test/mocks/movementsInMock'
import { prisonerSearchMock } from '../test/mocks/prisonerSearchMock'

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
          alertFlags: [],
          alerts: [],
          arrivedFrom: 'Cookham Wood',
          cellLocation: '1-1-1',
          dateOfBirth: '1980-01-01',
          ethnicity: '',
          firstName: 'Eddie',
          gender: '',
          lastName: 'Shannon',
          maritalStatus: '',
          mostSeriousOffence: '',
          movementTime: '10:30:00',
          nationality: '',
          prisonerNumber: 'A1234AB',
          religion: '',
          restrictedPatient: false,
          status: '',
          youthOffender: false,
        },
        {
          alertFlags: [
            {
              alertCodes: ['HID'],
              alertIds: ['HID'],
              classes: 'alert-status alert-status--medical',
              label: 'Hidden disability',
            },
          ],
          alerts: [
            {
              active: true,
              alertCode: 'HID',
              alertType: 'Hidden disability',
              expired: false,
            },
          ],
          arrivedFrom: 'Leeds',
          category: 'A',
          cellLocation: '1-1-1',
          dateOfBirth: '1980-01-01',
          ethnicity: '',
          firstName: 'John',
          gender: '',
          lastName: 'Smith',
          maritalStatus: '',
          mostSeriousOffence: '',
          movementTime: '10:00:00',
          nationality: '',
          prisonerNumber: 'A1234AA',
          religion: '',
          restrictedPatient: false,
          status: '',
          youthOffender: false,
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
})
