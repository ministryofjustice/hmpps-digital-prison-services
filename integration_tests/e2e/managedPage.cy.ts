import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import ManagedPage from '../pages/managedPage'

context('Managed Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [Role.GlobalSearch],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
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
    })
  })
})
