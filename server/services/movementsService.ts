import dpsShared from '@ministryofjustice/hmpps-connect-dps-shared-items'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchClient'
import { PrisonerWithAlerts } from './interfaces/establishmentRollService/PrisonerWithAlerts'
import { stripAgencyPrefix } from '../utils/utils'
import { Prisoner } from '../data/interfaces/prisoner'
import { BedAssignment } from '../data/interfaces/bedAssignment'
import { OffenderMovement } from '../data/interfaces/offenderMovement'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApiClient'

export default class MovementsService {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly prisonerSearchClientBuilder: RestClientBuilder<PrisonerSearchClient>,
    private readonly locationsInsidePrisonApiClientBuilder: RestClientBuilder<LocationsInsidePrisonApiClient>,
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
          alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(prisoner.alerts),
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
          alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(prisoner.alerts),
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
          alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(prisoner.alerts),
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
    if (!movements || !movements?.length) return []

    const prisonerNumbers = movements.map(movement => movement.offenderNo)
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
          alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(prisoner.alerts),
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
    if (!outPrisoners || !outPrisoners?.length) return []
    const prisonerNumbers = outPrisoners.map(prisoner => prisoner.offenderNo)

    const [prisoners, recentMovements] = await Promise.all([
      prisonerSearchClient.getPrisonersById(prisonerNumbers),
      prisonApi.getRecentMovements(prisonerNumbers),
    ])

    return this.mapCurrentlyOutPrisoners(prisoners, recentMovements)
  }

  public async getOffendersCurrentlyOutOfBed(
    clientToken: string,
    locationId: string,
  ): Promise<(PrisonerWithAlerts & { currentLocation: string; movementComment?: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)
    const locationsApi = this.locationsInsidePrisonApiClientBuilder(clientToken)

    const prisonersInLocations = await locationsApi.getPrisonersAtLocation(locationId)
    const outPrisoners = prisonersInLocations.flatMap(pl => pl.prisoners).filter(p => p.inOutStatus === 'OUT')
    if (!outPrisoners || !outPrisoners?.length) return []
    const prisonerNumbers = outPrisoners.map(prisoner => prisoner.prisonerNumber)

    const [prisoners, recentMovements] = await Promise.all([
      prisonerSearchClient.getPrisonersById(prisonerNumbers),
      prisonApi.getRecentMovements(prisonerNumbers),
    ])

    return this.mapCurrentlyOutPrisoners(prisoners, recentMovements)
  }

  public async getOffendersCurrentlyOutTotal(
    clientToken: string,
    caseLoadId: string,
  ): Promise<(PrisonerWithAlerts & { currentLocation: string; movementComment?: string })[]> {
    const prisonApi = this.prisonApiClientBuilder(clientToken)
    const prisonerSearchClient = this.prisonerSearchClientBuilder(clientToken)

    const outPrisoners = await prisonApi.getPrisonersCurrentlyOutOfPrison(caseLoadId)
    if (!outPrisoners || !outPrisoners?.length) return []
    const prisonerNumbers = outPrisoners.map(prisoner => prisoner.offenderNo)

    const [prisoners, recentMovements] = await Promise.all([
      prisonerSearchClient.getPrisonersById(prisonerNumbers),
      prisonApi.getRecentMovements(prisonerNumbers),
    ])

    return this.mapCurrentlyOutPrisoners(prisoners, recentMovements)
  }

  private mapCurrentlyOutPrisoners(
    prisoners: Prisoner[],
    recentMovements: OffenderMovement[],
  ): (PrisonerWithAlerts & {
    currentLocation: string
    movementComment?: string
  })[] {
    return prisoners
      .sort((a, b) => a.lastName.localeCompare(b.lastName, 'en', { ignorePunctuation: true }))
      .map(prisoner => {
        const recentMovement = recentMovements.find(movement => movement.offenderNo === prisoner.prisonerNumber)

        return {
          ...prisoner,
          alertFlags: dpsShared.alertFlags.getAlertFlagLabelsForAlerts(prisoner.alerts),
          currentLocation: recentMovement?.toCity,
          movementComment: recentMovement?.commentText,
        }
      })
  }
}
