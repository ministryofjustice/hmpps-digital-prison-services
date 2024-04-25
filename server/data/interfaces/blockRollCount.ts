export interface BlockRollCount {
  currentlyInCell: number
  outOfLivingUnits: number
  livingUnitId: number
  fullLocationPath: string
  locationCode: string
  livingUnitDesc: string
  parentLocationId?: number
  bedsInUse: number
  currentlyOut: number
  operationalCapacity?: number
  netVacancies?: number
  maximumCapacity: number
  availablePhysical: number
  outOfOrder: number
}
