import { Prisoner } from './prisoner'

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

export interface PrisonRollCountForCells {
  locationHierarchy: LocationHierarchy[]
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

interface LocationHierarchy {
  id: string
  prisonId: string
  code: string
  type: string
  localName: string
  pathHierarchy: string
  level: number
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

export interface PrisonersInLocation {
  cellLocation: string
  prisoners: Prisoner[]
}
