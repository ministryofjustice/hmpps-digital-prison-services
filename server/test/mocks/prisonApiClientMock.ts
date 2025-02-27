import { PrisonApiClient } from '../../data/interfaces/prisonApiClient'

const prisonApiClientMock: PrisonApiClient = {
  getUserCaseLoads: jest.fn(),
  getUserLocations: jest.fn(),
  setActiveCaseload: jest.fn(),
  getPrisonRollCountSummary: jest.fn(),
}

export default prisonApiClientMock
