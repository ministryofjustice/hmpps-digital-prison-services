export default interface PrisonRollCount {
  prisonId: string
  numUnlockRollToday: number
  numCurrentPopulation: number
  numArrivedToday: number
  numInReception: number
  numStillToArrive: number
  numOutToday: number
  numNoCellAllocated: number
  totals: {
    bedsInUse: number
    currentlyInCell: number
    currentlyOut: number
    workingCapacity: number
    netVacancies: number
    outOfOrder: number
  }
  locations: ResidentialLocation[]
}

export interface ResidentialLocation {
  locationId: string
  locationType: 'WING' | 'LAND' | 'LANDING' | 'SPUR' | 'CELL' | 'ROOM'
  locationCode: string
  fullLocationPath: string
  certified: boolean
  localName?: string
  rollCount: LocationRollCount
  subLocations: ResidentialLocation[]
}

interface LocationRollCount {
  bedsInUse: number
  currentlyInCell: number
  currentlyOut: number
  workingCapacity: number
  netVacancies: number
  outOfOrder: number
}
