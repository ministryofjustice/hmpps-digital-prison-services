import Page, { PageElement } from './page'

export default class InReceptionPage extends Page {
  constructor() {
    super(`In reception`)
  }

  inReceptionRows = (): PageElement => cy.get('table.in-reception-roll__table tbody tr')
}
