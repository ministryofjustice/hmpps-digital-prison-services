import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { BlockRollCount } from '../data/interfaces/blockRollCount'
import EstablishmentRollCount from './interfaces/establishmentRollService/EstablishmentRollCount'
import nestRollBlocks, { splitRollBlocks } from './utils/nestRollBlocks'

const getTotals = (array: BlockRollCount[], figure: keyof BlockRollCount): number =>
  array.reduce<number>((accumulator, block) => accumulator + ((block[figure] as number) || 0), 0)

export default class EstablishmentRollService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async getEstablishmentRollCounts(clientToken: string, caseLoadId: string): Promise<EstablishmentRollCount> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const [assignedRollBlocksCounts, unassignedRollBlocksCount, movementsCount, enrouteCount, caseLoadLocations] =
      await Promise.all([
        prisonApi.getRollCount(caseLoadId, { wingOnly: false }),
        prisonApi.getRollCount(caseLoadId, { unassigned: true }),
        prisonApi.getMovements(caseLoadId),
        prisonApi.getEnrouteRollCount(caseLoadId),
        prisonApi.getLocationsForPrison(caseLoadId),
      ])

    const cellSwapLocation = caseLoadLocations.find(location => location.description === 'CSWAP')

    const cellSwapDetails = cellSwapLocation
      ? await prisonApi.getAttributesForLocation(cellSwapLocation.locationId)
      : { noOfOccupants: 0 }

    const wingsSpursLandingsAssigned = splitRollBlocks(assignedRollBlocksCounts)
    const assignedWingsRollCount = wingsSpursLandingsAssigned.wings

    const unassignedIn =
      getTotals(unassignedRollBlocksCount, 'currentlyInCell') + getTotals(unassignedRollBlocksCount, 'outOfLivingUnits')
    const currentRoll =
      getTotals(assignedWingsRollCount, 'currentlyInCell') +
      getTotals(assignedWingsRollCount, 'outOfLivingUnits') +
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
        totalCurrentlyOut: getTotals(assignedWingsRollCount, 'currentlyOut') ?? 0,
        bedsInUse: getTotals(assignedWingsRollCount, 'bedsInUse') ?? 0,
        currentlyInCell: getTotals(assignedWingsRollCount, 'currentlyInCell') ?? 0,
        operationalCapacity: getTotals(assignedWingsRollCount, 'operationalCapacity') ?? 0,
        netVacancies: getTotals(assignedWingsRollCount, 'netVacancies') ?? 0,
        outOfOrder: getTotals(assignedWingsRollCount, 'outOfOrder') ?? 0,
      },
      assignedRollBlocksCounts: nestRollBlocks(wingsSpursLandingsAssigned),
    }
  }

  public async getLandingRollCounts(clientToken: string, caseLoadId: string, landingId: number) {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    return prisonApi.getRollCount(caseLoadId, {
      wingOnly: false,
      showCells: true,
      parentLocationId: landingId,
    })
  }
}
