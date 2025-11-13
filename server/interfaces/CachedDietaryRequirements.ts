import { HealthAndMedicationData } from '../data/interfaces/healthAndMedicationApiClient'

interface DietaryRequirementsFilter {
  id: string
  label: string
  count: number
}

export interface CachedDietaryRequirements {
  data: HealthAndMedicationData[]
  prisonId: string
  sorting: {
    nameAndNumber?: string
    location?: string
  }
  filters: {
    prisoners: DietaryRequirementsFilter[]
    location: DietaryRequirementsFilter[]
    personalisedDiet: DietaryRequirementsFilter[]
    medicalDiet: DietaryRequirementsFilter[]
    foodAllergies: DietaryRequirementsFilter[]
  }
}
