import Page, { PageElement } from './page'

export default class OutTodayPage extends Page {
  constructor() {
    super(`Out today`)
  }

  outTodayRows = (): PageElement => cy.get('table.out-today-roll__table tbody tr')
}
