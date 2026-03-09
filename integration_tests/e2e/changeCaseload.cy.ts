import ChangeCaseloadPage from '../pages/changeCaseload'
import Page from '../pages/page'

context('Change Caseload Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    const caseLoads = [
      { caseloadFunction: '', caseLoadId: 'KMI', currentlyActive: true, description: 'Kirkham (KMI)', type: '' },
      { caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: false, description: 'Moorland (MDI)', type: '' },
    ]
    cy.setupComponentsData({ caseLoads })
    cy.task('stubSetActiveCaseload')
  })

  it('should successfully change caseload', () => {
    cy.signIn({ redirectPath: '/change-caseload' })
    const page = Page.verifyOnPage(ChangeCaseloadPage)
    page.select().select('MDI')
    page.submitButton().click()
    cy.url().should('not.include', '/change-caseload')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
  })
})
