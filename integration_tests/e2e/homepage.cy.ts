import Page from '../pages/page'
import IndexPage from '../pages'

context('Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.signIn()
  })

  it('Homepage is visible', () => {
    cy.visit('/')
    Page.verifyOnPage(IndexPage)
  })
})
