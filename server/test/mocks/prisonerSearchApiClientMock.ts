import { PrisonerSearchClient } from '../../data/interfaces/prisonerSearchClient'

const prisonerSearchApiClientMock: PrisonerSearchClient = {
  getPrisonersById: jest.fn(),
  getCswapPrisonersInEstablishment: jest.fn(),
}

export default prisonerSearchApiClientMock
