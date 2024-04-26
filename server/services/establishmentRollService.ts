import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { BlockRollCount } from '../data/interfaces/blockRollCount'
import EstablishmentRollCount from './interfaces/EstablishmentRollCount'

const getTotals = (array: BlockRollCount[], figure: keyof BlockRollCount): number =>
  array.reduce<number>((accumulator, block) => accumulator + ((block[figure] as number) || 0), 0)

export default class EstablishmentRollService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getEstablishmentRollCounts(clientToken: string, caseLoadId: string): Promise<EstablishmentRollCount> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const [assignedRollBlocksCounts, unassignedRollBlocksCount, movementsCount, enrouteCount, caseLoadLocations] =
      await Promise.all([
        prisonApi.getRollCount({ prisonId: caseLoadId, unassigned: false }),
        prisonApi.getRollCount({ prisonId: caseLoadId, unassigned: true }),
        prisonApi.getMovements(caseLoadId),
        prisonApi.getEnrouteRollCount(caseLoadId),
        prisonApi.getLocationsForPrison(caseLoadId),
      ])

    const cellSwapLocation = caseLoadLocations.find(location => location.description === 'CSWAP')

    const cellSwapDetails = cellSwapLocation
      ? await prisonApi.getAttributesForLocation(cellSwapLocation.locationId)
      : { noOfOccupants: 0 }

    const unassignedIn =
      getTotals(unassignedRollBlocksCount, 'currentlyInCell') + getTotals(unassignedRollBlocksCount, 'outOfLivingUnits')
    const currentRoll =
      getTotals(assignedRollBlocksCounts, 'currentlyInCell') +
      getTotals(assignedRollBlocksCounts, 'outOfLivingUnits') +
      unassignedIn

    return {
      todayStats: {
        unlockRoll: currentRoll - movementsCount.in + movementsCount.out,
        inToday: movementsCount.in,
        outToday: movementsCount.out,
        currentRoll,
        unassignedIn,
        enroute: enrouteCount,
        noCellAllocated: cellSwapDetails?.noOfOccupants ?? 0,
        totalCurrentlyOut: getTotals(assignedRollBlocksCounts, 'currentlyOut') ?? 0,
        bedsInUse: getTotals(assignedRollBlocksCounts, 'bedsInUse') ?? 0,
        currentlyInCell: getTotals(assignedRollBlocksCounts, 'currentlyInCell') ?? 0,
        operationalCapacity: getTotals(assignedRollBlocksCounts, 'operationalCapacity') ?? 0,
        netVacancies: getTotals(assignedRollBlocksCounts, 'netVacancies') ?? 0,
        outOfOrder: getTotals(assignedRollBlocksCounts, 'outOfOrder') ?? 0,
      },
      assignedRollBlocksCounts,
    }
  }
}
