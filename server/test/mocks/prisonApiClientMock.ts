import type { PrisonApiClient } from '../../data/interfaces/prisonApiClient'

const prisonApiClientMock: jest.Mocked<PrisonApiClient> = {
  setActiveCaseload: jest.fn(),
  getPrisonRollCountSummary: jest.fn(),
  getLatestArrivalDates: jest.fn(),
  getPrisonerImage: jest.fn(),
}

export default prisonApiClientMock
