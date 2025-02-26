import EstablishmentRollService from './establishmentRollService'
import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import { prisonEstablishmentRollSummaryMock } from '../mocks/prisonRollCountSummaryMock'

describe('establishmentRollService', () => {
  let establishmentRollService: EstablishmentRollService

  beforeEach(() => {
    establishmentRollService = new EstablishmentRollService(() => prisonApiClientMock)
  })

  describe('getEstablishmentRollSummary', () => {
    it('should call the prisonApiClient with the correct parameters', async () => {
      await establishmentRollService.getEstablishmentRollSummary('token', 'LEI')
      expect(prisonApiClientMock.getPrisonRollCountSummary).toBeCalledWith('LEI')
    })

    it('should return the data from the API', async () => {
      prisonApiClientMock.getPrisonRollCountSummary = jest.fn().mockResolvedValue(prisonEstablishmentRollSummaryMock)
      const establishmentRollSummary = await establishmentRollService.getEstablishmentRollSummary('token', 'LEI')
      expect(establishmentRollSummary).toEqual(prisonEstablishmentRollSummaryMock)
    })
  })
})
