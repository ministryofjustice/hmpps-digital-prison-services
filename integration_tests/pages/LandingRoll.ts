import Page, { PageElement } from './page'

export default class LandingRollPage extends Page {
  constructor(title: string) {
    super(title)
  }

  rollCountRows = (): PageElement => cy.get('table.landing-roll__table tbody tr')
}
