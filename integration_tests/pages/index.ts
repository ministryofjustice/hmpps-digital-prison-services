import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Welcome to Digital Prison Services')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
