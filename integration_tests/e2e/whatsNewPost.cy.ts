import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import WhatsNewPostPage from '../pages/whatsNewPost'

context('Whats New', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`] })
    cy.setupComponentsData()
    cy.task('stubWhatsNewPosts', false)
    cy.signIn({ redirectPath: '/whats-new/whats-new-one' })
  })

  it('Whats New Post page is visible', () => {
    Page.verifyOnPage(WhatsNewPostPage)
  })

  context('Whats New Post', () => {
    it('should display whats new data', () => {
      const page = Page.verifyOnPage(WhatsNewPostPage)
      page.whatsNew().title().should('have.text', 'Whats new one')
      page.whatsNew().date().should('have.text', 'Published on 27 July 2023')
      page.whatsNew().summary().should('have.text', 'Summary')
      page.whatsNew().body().should('have.text', 'Content')
      page.whatsNew().link().should('have.attr', 'href', '/whats-new').and('have.text', 'Back to what’s new in DPS')
    })
  })
})
