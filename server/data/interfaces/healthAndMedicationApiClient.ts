import { DietaryRequirementsQueryParams } from '../../utils/generateListMetadata'
import { PagedList } from './pagedList'

export interface ValueWithMetadata<T> {
  value?: T
  lastModifiedAt: string
  lastModifiedBy: string
}

export interface ReferenceDataCodeSimple {
  id: string
  description: string
  listSequence: number
  isActive: boolean
}

export interface ReferenceDataCodeWithComment {
  value: ReferenceDataCodeSimple
  comment?: string
}

export interface HealthAndMedication {
  dietAndAllergy: {
    foodAllergies: ValueWithMetadata<ReferenceDataCodeWithComment[]>
    medicalDietaryRequirements: ValueWithMetadata<ReferenceDataCodeWithComment[]>
    personalisedDietaryRequirements: ValueWithMetadata<ReferenceDataCodeWithComment[]>
    cateringInstructions: ValueWithMetadata<string>
  }
}

export interface HealthAndMedicationForPrison {
  prisonerNumber: string
  firstName: string
  lastName: string
  location: string
  lastAdmissionDate?: string
  health: HealthAndMedication
}

export type HealthAndMedicationData = HealthAndMedicationForPrison & { arrivalDate: Date }

export interface HealthAndMedicationFilter {
  name: string
  value: string
  count: number
}

export interface HealthAndMedicationFilters {
  foodAllergies: HealthAndMedicationFilter[]
  medicalDietaryRequirements: HealthAndMedicationFilter[]
  personalisedDietaryRequirements: HealthAndMedicationFilter[]
  topLocationLevel: HealthAndMedicationFilter[]
  recentArrival: HealthAndMedicationFilter[]
}

export interface HealthAndMedicationApiClient {
  getHealthAndMedicationForPrison(
    prisonId: string,
    queryParams: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>>

  getFiltersForPrison(prisonId: string): Promise<HealthAndMedicationFilters>
}
