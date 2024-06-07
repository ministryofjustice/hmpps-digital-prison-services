import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubUserCaseLoads')
    cy.task('stubUserLocations')
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')
    cy.task('changeCaseload')
    cy.setupUserAuth()
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.setupUserAuth({ name: 'bobby brown', roles: ['ROLE_PRISON'] })
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })

  it('Page shown ok when roles are not found', () => {
    cy.task('stubGetStaffRoles', 403)
    cy.signIn()
    Page.verifyOnPage(IndexPage)
  })

  it('Page shown ok when roles call is unauthorised', () => {
    cy.task('stubGetStaffRoles', 404)
    cy.signIn()
    Page.verifyOnPage(IndexPage)
  })
})
