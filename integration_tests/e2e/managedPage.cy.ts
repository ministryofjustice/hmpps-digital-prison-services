import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import ManagedPage from '../pages/managedPage'

context('Managed Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`] })
    cy.setupComponentsData()
    cy.task('stubManagedPage', false)
    cy.signIn({ redirectPath: '/accessibility-statement' })
  })

  it('Managed page is visible', () => {
    Page.verifyOnPage(ManagedPage)
  })

  context('Display Managed Page', () => {
    it('should display managed page', () => {
      const page = Page.verifyOnPage(ManagedPage)
      page.whatsNew().title().should('have.text', 'Title 1')
      page.whatsNew().body().should('have.text', 'Content one')
      page.whatsNew().body().should('contain.html', '<img src="http://localhost:8080/test.png" alt="Test description">')
    })
  })
})
