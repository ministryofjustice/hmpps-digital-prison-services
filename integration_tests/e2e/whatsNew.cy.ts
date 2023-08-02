import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import WhatsNewPage from '../pages/whatsNew'

context('Whats New', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [Role.GlobalSearch],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubWhatsNewPosts')
    cy.signIn({ redirectPath: '/whats-new' })
  })

  it('Whats New page is visible', () => {
    Page.verifyOnPage(WhatsNewPage)
  })

  context('Whats New', () => {
    it('should display whats new data', () => {
      const page = Page.verifyOnPage(WhatsNewPage)
      page.whatsNew().whatsNewPost().should('have.length', 3)
      page.whatsNew().whatsNewPost().first().find('.whats-new-post__date').should('have.text', '27 July 2023')
      page.whatsNew().whatsNewPost().first().find('a').should('have.text', 'Whats new one')
      page.whatsNew().whatsNewPost().first().find('a').should('have.attr', 'href', '/whats-new/whats-new-one')
      page.whatsNew().whatsNewPost().first().find('.whats-new-post__summary').should('have.text', 'Summary')
    })
  })
})
