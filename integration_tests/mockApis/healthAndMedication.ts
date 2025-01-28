import { stubFor } from './wiremock'

export default {
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
}
