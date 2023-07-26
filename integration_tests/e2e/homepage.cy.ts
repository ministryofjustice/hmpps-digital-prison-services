import Page from '../pages/page'
import IndexPage from '../pages'
import { Role } from '../../server/enums/role'
import { todayDataMock } from '../../server/mocks/todayDataMock'

context('Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [Role.GlobalSearch],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.signIn()
    cy.visit('/')
  })

  it('Homepage is visible', () => {
    Page.verifyOnPage(IndexPage)
  })

  context('Hero', () => {
    it('should display H1, strap line and link in header', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.hero().h1().should('be.visible')
      page.hero().strapLine().should('be.visible')
      page.hero().link().should('be.visible')
    })
  })

  context('Search', () => {
    it('should display H2, radios, search fields and link', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.search().heading().should('be.visible')
      page.search().localGlobalRadios().should('be.visible')
      page.search().localGlobalRadios().find('label[for=search-type-local]').should('contain.text', 'Leeds (HMP)')
      page.search().nameField().should('be.visible')
      page.search().locationField().should('be.visible').and('contain.text', 'All')
      page.search().locationField().children().should('have.length', 3)
      page.search().viewAllLink().should('be.visible').and('contain.text', 'Leeds (HMP)')
    })

    it('should disable location dropdown when choosing global', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.search().locationField().should('be.enabled')
      page.search().localGlobalRadios().find('label[for=search-type-global]').click()
      page.search().locationField().should('be.disabled')
    })
  })

  context('Services - with global search', () => {
    it('should display h3', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.services().heading().should('be.visible')
      page.services().serviceOne().should('be.visible')
      page.services().serviceTwo().should('be.visible')
      page.services().serviceThree().should('be.visible')
    })
  })

  context('Today', () => {
    it('should display today data', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.today().heading().should('be.visible').and('contain.text', 'Today in Leeds (HMP)')
      page.today().lastUpdated().should('be.visible')

      page.today().unlockRollCard().should('be.visible').find('h3').contains("Today's unlock roll")
      page.today().unlockRollCard().find('.today-card__count').contains(todayDataMock.unlockRollCount)

      page.today().populationCard().should('be.visible').find('h3').contains('Current population')
      page.today().populationCard().find('.today-card__count').contains(todayDataMock.currentPopulationCount)
      page.today().populationCard().find('a').contains('Establishment roll')

      page.today().inTodayCard().should('be.visible').find('h3').contains('In today')
      page.today().inTodayCard().find('.today-card__count').contains(todayDataMock.inTodayCount)
      page.today().inTodayCard().find('a').contains('People in today')

      page.today().outTodayCard().should('be.visible').find('h3').contains('Out today')
      page.today().outTodayCard().find('.today-card__count').contains(todayDataMock.outTodayCount)
      page.today().outTodayCard().find('a').contains('People out today')
    })
  })
})

context('Homepage - no global search', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.signIn()
    cy.visit('/')
  })

  it('should not display radios if user does not have Global Search', () => {
    const page = Page.verifyOnPage(IndexPage)
    page.search().heading().should('be.visible')
    page.search().localGlobalRadios().should('not.exist')
    page.search().nameField().should('be.visible')
    page.search().locationField().should('be.visible').and('contain.text', 'All')
    page.search().locationField().children().should('have.length', 3)
    page.search().viewAllLink().should('be.visible').and('contain.text', 'Leeds (HMP)')
  })

  context('Services - no global search', () => {
    it('should display h3', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.services().heading().should('be.visible')
      page.services().serviceOne().should('be.visible')
      page.services().serviceTwo().should('be.visible')
      page.services().serviceThree().should('not.exist')
    })
  })
})
