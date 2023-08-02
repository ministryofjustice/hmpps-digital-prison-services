import Page, { PageElement } from './page'

export default class WhatsNewPostPage extends Page {
  constructor() {
    super('Whats new one')
  }

  whatsNew = () => {
    const whatsNewPost = (): PageElement => cy.get('.whats-new-post--full')

    return {
      title: () => whatsNewPost().find('h1'),
      summary: () => whatsNewPost().find('.whats-new-post__summary'),
      date: () => whatsNewPost().find('.whats-new-post__date'),
      body: () => whatsNewPost().find('.whats-new-post__body'),
      link: () => whatsNewPost().find('[data-qa=back-to-whats-new-link]'),
    }
  }
}
