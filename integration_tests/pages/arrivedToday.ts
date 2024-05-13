import Page, { PageElement } from './page'

export default class ArrivedTodayPage extends Page {
  constructor() {
    super(`Arrived today`)
  }

  arrivedTodayRows = (): PageElement => cy.get('table.arrived-today-roll__table tbody tr')
}
