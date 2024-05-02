import Page, { PageElement } from './page'
import { formatDate } from '../../server/utils/dateHelpers'

export default class EstablishmentRollPage extends Page {
  constructor() {
    const today = new Date().toISOString()
    super(`Establishment roll for ${formatDate(today, 'full').replace(',', '')}`)
  }

  todaysStats = () => ({
    unlockRoll: (): PageElement => cy.get('[data-qa=unlock-roll]'),
    currentPopulation: (): PageElement => cy.get('[data-qa=current-roll]'),
    arrivedToday: (): PageElement => cy.get('[data-qa=in-today]'),
    inReception: (): PageElement => cy.get('[data-qa=unassigned-in]'),
    stillToArrive: (): PageElement => cy.get('[data-qa=enroute]'),
    outToday: (): PageElement => cy.get('[data-qa=out-today]'),
    noCellAllocated: (): PageElement => cy.get('[data-qa=no-cell-allocated]'),
  })

  assignedRollCountRows = (): PageElement => cy.get('table.establishment-roll__table tbody tr')
}
