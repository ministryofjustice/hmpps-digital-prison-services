export interface OffenderIn {
  offenderNo: string
  bookingId: number
  dateOfBirth: string
  firstName: string
  lastName: string
  middleName?: string
  fromAgencyId: string
  fromAgencyDescription: string
  toAgencyId: string
  toAgencyDescription: string
  fromCity: string
  toCity: string
  movementTime: string
  movementDateTime: string
  location: string
}
