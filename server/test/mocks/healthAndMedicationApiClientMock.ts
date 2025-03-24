import { HealthAndMedicationApiClient } from '../../data/interfaces/healthAndMedicationApiClient'

const healthAndMedicationApiClientMock: HealthAndMedicationApiClient = {
  getHealthAndMedicationForPrison: jest.fn(),
}

export default healthAndMedicationApiClientMock
