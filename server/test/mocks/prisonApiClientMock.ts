import { PrisonApiClient } from '../../data/interfaces/prisonApiClient'

const prisonApiClientMock: PrisonApiClient = {
  getUserCaseLoads: jest.fn(),
  getUserLocations: jest.fn(),
  getRollCount: jest.fn(),
  getEnrouteRollCount: jest.fn(),
  getLocationsForPrison: jest.fn(),
  getAttributesForLocation: jest.fn(),
  getMovements: jest.fn(),
  getStaffRoles: jest.fn(),
  setActiveCaseload: jest.fn(),
}

export default prisonApiClientMock