import Page, { PageElement } from './page'

export default class EnRoutePage extends Page {
  constructor() {
    super(`En route to Leeds (HMP)`)
  }

  enRouteRows = (): PageElement => cy.get('table.en-route-roll__table tbody tr')
}
