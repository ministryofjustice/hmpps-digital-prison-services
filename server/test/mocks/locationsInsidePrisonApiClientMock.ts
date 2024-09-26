import { LocationsInsidePrisonApiClient } from '../../data/interfaces/locationsInsidePrisonApiClient'

const locationsInsidePrisonApiClientMock: LocationsInsidePrisonApiClient = {
  getLocation: jest.fn(),
  getPrisonRollCount: jest.fn(),
  getPrisonRollCountForLocation: jest.fn(),
  getPrisonersAtLocation: jest.fn(),
  getPrisonersInPrison: jest.fn(),
}

export default locationsInsidePrisonApiClientMock
