import { DietaryRequirementsQueryParams } from '../../utils/generateListMetadata'
import { PagedList } from './pagedList'

export interface ValueWithMetadata<T> {
  value?: T
  lastModifiedAt: string
  lastModifiedBy: string
}

export interface ReferenceDataDomain {
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
  referenceDataCodes?: ReferenceDataCode[]
  subDomains: ReferenceDataDomain[]
}

export interface ReferenceDataCode {
  id: string
  domain: string
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
}

export interface ReferenceDataCodeSimple {
  id: string
  description: string
  listSequence: number
  isActive: boolean
}

export interface FieldHistory {
  valueInt: number
  valueString: string
  valueRef: ReferenceDataCodeSimple
  appliesFrom: string
  appliesTo: string
  createdBy: string
  source: string
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

export interface HealthAndMedicationUpdate {
  smokerOrVaper?: string
  foodAllergies?: string[]
  medicalDietaryRequirements?: string[]
}

export interface HealthAndMedicationForPrison {
  prisonerNumber: string
  firstName: string
  lastName: string
  location: string
  health: HealthAndMedication
}

export type HealthAndMedicationData = HealthAndMedicationForPrison & { arrivalDate: Date }

export interface HealthAndMedicationApiClient {
  getHealthAndMedicationForPrison(
    prisonId: string,
    queryParams: DietaryRequirementsQueryParams,
  ): Promise<PagedList<HealthAndMedicationForPrison>>
}
