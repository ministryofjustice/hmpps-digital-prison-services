import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import ChangeCaseloadPage from '../pages/changeCaseload'
import { Role } from '../../server/enums/role'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubUserCaseLoads')
    cy.task('stubUserLocations')
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')
    cy.task('changeCaseload')
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
    cy.setupUserAuth()
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.setupUserAuth()
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.setupUserAuth()
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.manageDetails().click()
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('User with one caseload does not see change caseload link', () => {
    cy.setupUserAuth()
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.changeCaseloadItem().should('not.exist')
  })

  it('User with multiple caseloads can change their caseload', () => {
    cy.setupUserAuth({
      roles: [Role.GlobalSearch],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
        { caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: false, description: 'Moorland (HMP)', type: '' },
      ],
    })
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.changeCaseloadItem().should('be.visible')
    indexPage.changeCaseload().click()
    Page.verifyOnPage(ChangeCaseloadPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.setupUserAuth()
    cy.signIn()
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.setupUserAuth()
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubAuthUser', { name: 'bobby brown', activeCaseLoadId: 'LEI' })
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })
})
