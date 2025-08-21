import { startOfDay } from 'date-fns'
import DietReportingService from './dietReportingService'
import prisonApiClientMock from '../test/mocks/prisonApiClientMock'
import healthAndMedicationApiClientMock from '../test/mocks/healthAndMedicationApiClientMock'
import { PagedList } from '../data/interfaces/pagedList'
import { HealthAndMedicationForPrison } from '../data/interfaces/healthAndMedicationApiClient'

describe('DietReportingService', () => {
  let dietReportingService: DietReportingService

  beforeEach(() => {
    jest.resetAllMocks()
    dietReportingService = new DietReportingService(
      () => healthAndMedicationApiClientMock,
      () => prisonApiClientMock,
    )
  })

  it('should get health and medication data for a prison', async () => {
    const healthAndMedicationForPrison: PagedList<HealthAndMedicationForPrison> = {
      metadata: {
        first: true,
        last: true,
        numberOfElements: 2,
        offset: 0,
        pageNumber: 0,
        size: 2,
        totalElements: 2,
        totalPages: 1,
      },
      content: [
        {
          prisonerNumber: 'A1234AA',
          firstName: 'JOHN',
          lastName: 'SMITH',
          location: 'C-3-010',
          health: {
            dietAndAllergy: {
              foodAllergies: null,
              medicalDietaryRequirements: null,
              personalisedDietaryRequirements: null,
              cateringInstructions: null,
            },
          },
        },
        {
          prisonerNumber: 'A2345BB',
          firstName: 'JAMES',
          lastName: 'WILSON',
          location: 'C-2-011',
          health: {
            dietAndAllergy: {
              foodAllergies: null,
              medicalDietaryRequirements: null,
              personalisedDietaryRequirements: null,
              cateringInstructions: null,
            },
          },
        },
      ],
    }
    healthAndMedicationApiClientMock.getHealthAndMedicationForPrison = jest.fn(async () => healthAndMedicationForPrison)
    prisonApiClientMock.getLatestArrivalDates = jest.fn(async () => [
      {
        offenderNo: 'A1234AA',
        latestArrivalDate: '2025-01-01',
      },
    ])

    const dietaryRequirements = await dietReportingService.getDietaryRequirementsForPrison('token', 'LEI', {})

    expect(prisonApiClientMock.getLatestArrivalDates).toHaveBeenCalledWith(['A1234AA', 'A2345BB'])
    expect(dietaryRequirements.content.length).toBe(2)
    expect(dietaryRequirements.content[0].prisonerNumber).toBe('A1234AA')
    expect(dietaryRequirements.content[0].lastName).toBe('SMITH')
    expect(dietaryRequirements.content[0].arrivalDate).toEqual(startOfDay('2025-01-01'))
    expect(dietaryRequirements.content[1].prisonerNumber).toBe('A2345BB')
    expect(dietaryRequirements.content[1].lastName).toBe('WILSON')
    expect(dietaryRequirements.content[1].arrivalDate).toBeUndefined()
  })
})
