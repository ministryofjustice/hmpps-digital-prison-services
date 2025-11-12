import { HealthAndMedicationData } from '../data/interfaces/healthAndMedicationApiClient'

export interface CachedDietaryRequirements {
  data: HealthAndMedicationData[]
  prisonId: string
  sorting: {
    nameAndNumber?: string
    location?: string
  }
}
