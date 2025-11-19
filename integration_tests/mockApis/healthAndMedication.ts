import { stubFor } from './wiremock'
import { HealthAndMedicationFilter } from '../../server/data/interfaces/healthAndMedicationApiClient'

export default {
  stubHealthAndMedicationPing: (httpStatus = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/health-and-medication/health/ping',
      },
      response: {
        status: httpStatus,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
      },
    }),
  stubHealthAndMedicationForPrison: (prisonId: string) => {
    const content = [
      {
        firstName: 'Richard',
        lastName: 'Smith',
        prisonerNumber: 'G4879UP',
        location: 'C-3-010',
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
        name: 'George Harrison',
        prisonerNumber: 'G6333VK',
        location: 'B-1-042',
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
        health: {
          dietAndAllergy: {
            medicalDietaryRequirements: { value: [] },
            foodAllergies: { value: [] },
            personalisedDietaryRequirements: { value: [{ value: { id: 'x', description: 'Kosher' } }] },
          },
        },
      },
    ]

    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/health-and-medication/prisons/${prisonId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          content,
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
        },
      },
    })
  },
  stubHealthAndMedicationFiltersForPrison: (prisonId: string) => {
    const filters = {
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
      ] as HealthAndMedicationFilter[],
    }

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/health-and-medication/prisons/${prisonId}/filters`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: filters,
      },
    })
  },
}
