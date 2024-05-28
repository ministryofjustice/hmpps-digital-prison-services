export interface OffenderMovement {
  offenderNo: string
  bookingId: number
  dateOfBirth: string
  firstName: string
  lastName: string
  middleName?: string
  fromAgency: string
  fromAgencyDescription: string
  toAgency: string
  toAgencyDescription: string
  toCity: string
  commentText?: string
  movementType: 'CRT' | 'ADM' | 'REL' | 'TAP' | 'TRN'
  movementTypeDescription: string
  movementReason: string
  movementReasonDescription: string
  directionCode: 'IN' | 'OUT'
  movementTime: string
  movementDate: string
}
