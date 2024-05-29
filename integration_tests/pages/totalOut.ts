import Page, { PageElement } from './page'

export default class TotalOutPage extends Page {
  constructor() {
    super('Total currently out')
  }

  currentlyOutRows = (): PageElement => cy.get('table.currently-out-roll__table tbody tr')
}
