import Page, { PageElement } from './page'

export default class WhatsNewPostPage extends Page {
  constructor() {
    super('Whats new one')
  }

  get whatsNew() {
    const whatsNewPost = (): PageElement => cy.get('.whats-new-post--full')

    return {
      get title() {
        return whatsNewPost().find<HTMLHeadingElement>('h1')
      },
      get summary() {
        return whatsNewPost().find<HTMLDivElement | HTMLParagraphElement>('.whats-new-post__summary')
      },
      get date() {
        return whatsNewPost().find<HTMLDivElement | HTMLTimeElement>('.whats-new-post__date')
      },
      get body() {
        return whatsNewPost().find<HTMLPreElement>('.whats-new-post__body')
      },
      get link() {
        return whatsNewPost().find<HTMLAnchorElement>('[data-qa=back-to-whats-new-link]')
      },
    }
  }
}
