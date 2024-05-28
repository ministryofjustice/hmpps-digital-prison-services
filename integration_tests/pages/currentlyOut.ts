import Page, { PageElement } from './page'

export default class CurrentlyOutPage extends Page {
  constructor() {
    super(`Currently out - A-wing`)
  }

  currentlyOutRows = (): PageElement => cy.get('table.currently-out-roll__table tbody tr')
}
