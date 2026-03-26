import Page, { type PageElement } from './page'

export default class WhatsNewPage extends Page {
  constructor() {
    super('What’s new in DPS')
  }

  get whatsNewPosts(): PageElement {
    return cy.get('.whats-new-post')
  }
}
