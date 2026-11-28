import Page, { type PageElement } from './page'

export default class ManagedPage extends Page {
  constructor() {
    super('Title 1')
  }

  get whatsNew() {
    const managedPage = (): PageElement => cy.get('.hmpps-managed-page')

    return {
      get title(): PageElement<HTMLHeadingElement> {
        return managedPage().find('h1')
      },
      get body(): PageElement<HTMLPreElement> {
        return managedPage().find('.hmpps-managed-page__body')
      },
    }
  }
}
