import { BlockRollCount } from '../../data/interfaces/blockRollCount'

export default interface EstablishmentRollCount {
  todayStats: {
    unlockRoll: number
    inToday: number
    outToday: number
    currentRoll: number
    unassignedIn: number
    enroute: number
    noCellAllocated: number
    totalCurrentlyOut: number
    bedsInUse: number
    currentlyInCell: number
    operationalCapacity: number
    netVacancies: number
    outOfOrder: number
  }
  assignedRollBlocksCounts: BlockRollCount[]
}
