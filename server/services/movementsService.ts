import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { mapAlerts } from './utils/alertFlagLabels'
import { PrisonerWithAlerts } from './interfaces/establishmentRollService/PrisonerWithAlerts'
import { stripAgencyPrefix } from '../utils/utils'
import { Prisoner } from '../data/interfaces/prisoner'
import { BedAssignment } from '../data/interfaces/bedAssignment'

export default class MovementsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>,
  ) {}

  public async getArrivedTodayPrisoners(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(PrisonerWithAlerts & { movementTime: string; arrivedFrom: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const movements = await prisonApi.getMovementsIn(caseLoadId, new Date().toISOString())

    if (!movements || !movements?.length) return []
    const prisoners = await prisonerSearchClient.getPrisonersById(movements.map(movement => movement.offenderNo))

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const prisonerMovement = movements.find(movement => movement.offenderNo === prisoner.prisonerNumber)
        return {
          ...prisoner,
          movementTime: prisonerMovement?.movementTime,
          arrivedFrom: prisonerMovement?.fromAgencyDescription || prisonerMovement?.fromCity,
          alertFlags: mapAlerts(prisoner),
        }
      })
  }

  public async getOutTodayPrisoners(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(PrisonerWithAlerts & { timeOut: string; reasonDescription: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const movements = await prisonApi.getMovementsOut(caseLoadId, new Date().toISOString())

    if (!movements || !movements?.length) return []
    const prisoners = await prisonerSearchClient.getPrisonersById(movements.map(movement => movement.offenderNo))

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const prisonerMovement = movements.find(movement => movement.offenderNo === prisoner.prisonerNumber)
        return {
          ...prisoner,
          timeOut: prisonerMovement?.timeOut,
          reasonDescription: prisonerMovement.reasonDescription,
          alertFlags: mapAlerts(prisoner),
        }
      })
  }

  public async getEnRoutePrisoners(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(PrisonerWithAlerts & { from: string; reason: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const movements = await prisonApi.getMovementsEnRoute(caseLoadId)

    if (!movements || !movements?.length) return []
    const prisoners = await prisonerSearchClient.getPrisonersById(movements.map(movement => movement.offenderNo))

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const prisonerMovement = movements.find(movement => movement.offenderNo === prisoner.prisonerNumber)
        return {
          ...prisoner,
          from: prisonerMovement?.fromAgencyDescription,
          reason: prisonerMovement?.movementReasonDescription,
          alertFlags: mapAlerts(prisoner),
          movementTime: prisonerMovement?.movementTime,
          movementDate: prisonerMovement?.movementDate,
        }
      })
  }

  public async getInReceptionPrisoners(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(PrisonerWithAlerts & { from: string; timeArrived: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const movements = await prisonApi.getMovementsInReception(caseLoadId)
    const prisonerNumbers = movements.map(movement => movement.offenderNo)

    if (!movements || !movements?.length) return []
    const [prisoners, recentMovements] = await Promise.all([
      prisonerSearchClient.getPrisonersById(prisonerNumbers),
      prisonApi.getRecentMovements(prisonerNumbers),
    ])

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const recentMovement = recentMovements.find(movement => movement.offenderNo === prisoner.prisonerNumber)

        return {
          ...prisoner,
          alertFlags: mapAlerts(prisoner),
          from: recentMovement?.fromAgencyDescription,
          timeArrived: recentMovement?.movementTime,
        }
      })
  }

  public async getNoCellAllocatedPrisoners(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(Prisoner & { movedBy: string; previousCell: string; timeOut: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const { content: cellSwapPrisoners } = await prisonerSearchClient.getCswapPrisonersInEstablishment(caseLoadId)
    if (!cellSwapPrisoners?.length) return []

    const prisonersWithLocations: {
      prisoner: Prisoner
      currentLocation: BedAssignment
      previousLocation: BedAssignment
    }[] = await Promise.all(
      cellSwapPrisoners.map(async prisoner => {
        const { content: cellHistory } = await prisonApi.getOffenderCellHistory(prisoner.bookingId)

        const cellHistoryDescendingSequence = cellHistory.sort(
          (left, right) => right.bedAssignmentHistorySequence - left.bedAssignmentHistorySequence,
        )
        const currentLocation = cellHistoryDescendingSequence[0]
        const previousLocation = cellHistoryDescendingSequence[1]

        return {
          prisoner,
          currentLocation,
          previousLocation,
        }
      }),
    )

    const allStaffUsernames = prisonersWithLocations.map(prisoner => prisoner.currentLocation.movementMadeBy)
    const allStaffDetails = allStaffUsernames.length
      ? await prisonApi.getUserDetailsList([...new Set(allStaffUsernames)])
      : []

    return prisonersWithLocations.map(prisonerWithLocations => {
      const { currentLocation, previousLocation, prisoner } = prisonerWithLocations
      const movementMadeBy = allStaffDetails.find(staffUser => staffUser.username === currentLocation.movementMadeBy)

      return {
        ...prisoner,
        movedBy: movementMadeBy ? `${movementMadeBy.firstName} ${movementMadeBy.lastName}` : '',
        previousCell: stripAgencyPrefix(previousLocation.description, caseLoadId),
        timeOut: previousLocation.assignmentEndDateTime,
      }
    })
  }

  public async getOffendersCurrentlyOutOfLivingUnit(
    clientToken: string,
    livingUnitId: string,
  ): Promise<(PrisonerWithAlerts & { currentLocation: string; movementComment?: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const outPrisoners = await prisonApi.getPrisonersCurrentlyOutOfLivingUnit(livingUnitId)
    const prisonerNumbers = outPrisoners.map(prisoner => prisoner.offenderNo)
    if (!outPrisoners || !outPrisoners?.length) return []

    const [prisoners, recentMovements] = await Promise.all([
      prisonerSearchClient.getPrisonersById(prisonerNumbers),
      prisonApi.getRecentMovements(prisonerNumbers),
    ])

    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const recentMovement = recentMovements.find(movement => movement.offenderNo === prisoner.prisonerNumber)

        return {
          ...prisoner,
          alertFlags: mapAlerts(prisoner),
          currentLocation: recentMovement?.toCity,
          movementComment: recentMovement?.commentText,
        }
      })
  }
}
