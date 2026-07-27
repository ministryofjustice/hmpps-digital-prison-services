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
    // A backUrl on another service, which is the case that matters: isSafeForRedirect only trusts
    // config.domain or an https .service.justice.gov.uk host, and config.domain is not the port the
    // app is served on under feature.env
    const backUrl = 'https://digital-dev.prison.service.justice.gov.uk/prison/KMI?status=ACTIVE'
    cy.visit(`/change-caseload?backUrl=${encodeURIComponent(backUrl)}`)

    Page.verifyOnPage(ChangeCaseloadPage)
    cy.get('input[name="backUrl"]').should('have.value', backUrl)

    // Submitted by request rather than by clicking, so the assertion can see the redirect itself
    // instead of the browser trying to follow it off-site
    cy.get('input[name="_csrf"]')
      .invoke('val')
      .then(csrfToken => {
        cy.request({
          method: 'POST',
          url: '/change-caseload',
          form: true,
          body: { caseLoadId: 'MDI', backUrl, _csrf: csrfToken },
          followRedirect: false,
        }).then(response => {
          expect(response.status).to.eq(302)
          // Services being returned to need to know the caseload changed, since their url may still
          // name the prison the user has just left
          expect(response.headers.location).to.eq(
            'https://digital-dev.prison.service.justice.gov.uk/prison/KMI?status=ACTIVE&caseloadChanged=true',
          )
        })
      })
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
