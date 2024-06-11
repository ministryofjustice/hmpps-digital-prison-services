import { PrisonApiClient } from '../../data/interfaces/prisonApiClient'

const prisonApiClientMock: PrisonApiClient = {
  getUserCaseLoads: jest.fn(),
  getUserLocations: jest.fn(),
  getRollCount: jest.fn(),
  getAttributesForLocation: jest.fn(),
  getMovements: jest.fn(),
  getStaffRoles: jest.fn(),
  setActiveCaseload: jest.fn(),
  getLocation: jest.fn(),
  getMovementsIn: jest.fn(),
  getPrisonerImage: jest.fn(),
  getMovementsOut: jest.fn(),
  getMovementsEnRoute: jest.fn(),
  getRecentMovements: jest.fn(),
  getMovementsInReception: jest.fn(),
  getOffenderCellHistory: jest.fn(),
  getUserDetailsList: jest.fn(),
  getPrisonersCurrentlyOutOfLivingUnit: jest.fn(),
  getPrisonersCurrentlyOutOfPrison: jest.fn(),
  getPrisonRollCount: jest.fn(),
  getPrisonRollCountForLocation: jest.fn(),
}

export default prisonApiClientMock
