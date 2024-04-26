export interface OffenderCell {
  id: number
  description: string
  userDescription: string
  capacity: number
  noOfOccupants: number
  attributes: {
    code: string
    description: string
  }
}
