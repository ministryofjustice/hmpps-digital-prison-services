import Page, { PageElement } from './page'

export default class WhatsNewPage extends Page {
  constructor() {
    super('What’s new in DPS')
  }

  whatsNew = () => {
    const whatsNewSection = (): PageElement => cy.get('.dps-whats-new')

    return {
      whatsNewPost: () => whatsNewSection().find('.whats-new-post'),
    }
  }
}
