import Page, { PageElement } from './page'

export default class ManagedPage extends Page {
  constructor() {
    super('Title 1')
  }

  whatsNew = () => {
    const managedPage = (): PageElement => cy.get('.hmpps-managed-page')

    return {
      title: () => managedPage().find('h1'),
      body: () => managedPage().find('.hmpps-managed-page__body'),
    }
  }
}
