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
    cy.signIn({ redirectPath: '/change-caseload' })
  })

  it('should successfully change caseload', () => {
    const page = Page.verifyOnPage(ChangeCaseloadPage)
    page.select().select('MDI')
    page.submitButton().click()
    cy.url().should('not.include', '/change-caseload')
    cy.url().should('eq', `${Cypress.config().baseUrl}/`)
  })

  it('should return the user to where they came from, flagging the caseload change', () => {
    const backUrl = `${Cypress.config().baseUrl}/?status=ACTIVE`
    cy.visit(`/change-caseload?backUrl=${encodeURIComponent(backUrl)}`)

    const page = Page.verifyOnPage(ChangeCaseloadPage)
    page.select().select('MDI')
    page.submitButton().click()

    // Services being returned to need to know the caseload changed, since their url may still name
    // the prison the user has just left
    cy.location('pathname').should('eq', '/')
    cy.location('search').should('eq', '?status=ACTIVE&caseloadChanged=true')
  })

  it('should show error if user somehow inputs invalid data', () => {
    const page = Page.verifyOnPage(ChangeCaseloadPage)
    page.select().then($select => {
      $select.val('INVALID_CASELOAD')
      $select.trigger('change')
    })
    page.submitButton().click()
    cy.get('h1').should('contain.text', 'Sorry, there is a problem with the service')
  })
})
