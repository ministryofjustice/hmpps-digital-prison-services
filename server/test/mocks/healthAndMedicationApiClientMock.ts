import {
  HealthAndMedicationApiClient,
  HealthAndMedicationForPrison,
} from '../../data/interfaces/healthAndMedicationApiClient'
import { PagedList } from '../../data/interfaces/pagedList'

export const mockHealthAndMedicationResponse = {
  content: [
    {
      firstName: 'Richard',
      lastName: 'Smith',
      prisonerNumber: 'G4879UP',
      location: 'C-3-010',
      lastAdmissionDate: '2026-02-18',
      health: {
        dietAndAllergy: {
          medicalDietaryRequirements: {
            value: [
              { value: { id: 'x', description: 'Coeliac (cannot eat gluten)' } },
              { value: { id: 'x', description: 'Nutrient Deficiency' } },
              { value: { id: '_OTHER' }, comment: 'has to eat a low copper diet' },
            ],
          },
          foodAllergies: { value: [{ value: { id: 'x', description: 'Egg' } }] },
          personalisedDietaryRequirements: { value: [{ value: { id: 'x', description: 'Kosher' } }] },
          cateringInstructions: { value: 'Serve food on a plate' },
        },
      },
    },
    {
      firstName: 'George',
      lastName: 'Harrison',
      prisonerNumber: 'G6333VK',
      location: 'B-1-042',
      lastAdmissionDate: '2026-02-10',
      health: {
        dietAndAllergy: {
          medicalDietaryRequirements: { value: [] },
          foodAllergies: { value: [{ value: { id: 'x', description: 'Sesame' } }] },
          personalisedDietaryRequirements: { value: [] },
        },
      },
    },
    {
      firstName: 'Harry',
      lastName: 'Thompson',
      prisonerNumber: 'G3101UO',
      location: 'F-5-031',
      lastAdmissionDate: '2026-01-18',
      health: {
        dietAndAllergy: {
          medicalDietaryRequirements: { value: [] },
          foodAllergies: { value: [] },
          personalisedDietaryRequirements: { value: [{ value: { id: 'x', description: 'Kosher' } }] },
        },
      },
    },
  ],
  metadata: {
    first: true,
    last: false,
    numberOfElements: 3,
    offset: 0,
    pageNumber: 1,
    size: 3,
    totalElements: 3,
    totalPages: 1,
  },
} as unknown as PagedList<HealthAndMedicationForPrison>

export const mockHealthAndMedicationFiltersResponse = {
  foodAllergies: [
    {
      name: 'Peanuts',
      value: 'PEANUTS',
      count: 3,
    },
    {
      name: 'Mustard',
      value: 'MUSTARD',
      count: 4,
    },
  ],
  medicalDietaryRequirements: [
    {
      name: 'Coeliac (cannot eat gluten)',
      value: 'COELIAC',
      count: 1,
    },
  ],
  personalisedDietaryRequirements: [
    {
      name: 'Kosher',
      value: 'KOSHER',
      count: 7,
    },
  ],
  topLocationLevel: [
    {
      name: 'B',
      value: 'B',
      count: 1,
    },
    {
      name: 'C',
      value: 'C',
      count: 1,
    },
    {
      name: 'F',
      value: 'F',
      count: 1,
    },
  ],
  recentArrival: [
    {
      name: 'Arrived in the last 3 days',
      value: 'ARRIVED_LAST_3_DAYS',
      count: 2,
    },
  ],
}

const healthAndMedicationApiClientMock: HealthAndMedicationApiClient = {
  getHealthAndMedicationForPrison: jest.fn(async () => mockHealthAndMedicationResponse),
  getFiltersForPrison: jest.fn(async () => mockHealthAndMedicationFiltersResponse),
}

export default healthAndMedicationApiClientMock
