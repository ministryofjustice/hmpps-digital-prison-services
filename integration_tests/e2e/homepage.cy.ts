import Page from '../pages/page'
import IndexPage from '../pages'
import { Role } from '../../server/enums/role'
import { todayDataMock } from '../../server/mocks/todayDataMock'

context('Homepage', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')
    cy.signIn()
    cy.visit('/')
  })

  it('Homepage is visible', () => {
    Page.verifyOnPage(IndexPage)
  })

  context('Outage Banner', () => {
    it('should display outage banner', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.outageBanner().should('contain.text', 'Banner')
    })
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

      page.today().inTodayCard().should('be.visible').find('h3').contains('Arrived today')
      page.today().inTodayCard().find('.today-card__count').contains(todayDataMock.inTodayCount)
      page.today().inTodayCard().find('a').contains('Arrived today')

      page.today().outTodayCard().should('be.visible').find('h3').contains('Out today')
      page.today().outTodayCard().find('.today-card__count').contains(todayDataMock.outTodayCount)
      page.today().outTodayCard().find('a').contains('People out today')
    })
  })

  context('Whats New', () => {
    it('should display whats new data', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.whatsNew().heading().should('be.visible').and('contain.text', "What's new in DPS")
      page.whatsNew().whatsNewPost().should('have.length', 3)
      page.whatsNew().whatsNewPost().first().find('.whats-new-post__date').should('have.text', '27 July 2023')
      page.whatsNew().whatsNewPost().first().find('a').should('have.text', 'Whats new one')
      page.whatsNew().whatsNewPost().first().find('a').should('have.attr', 'href', '/whats-new/whats-new-one')
      page.whatsNew().whatsNewPost().first().find('.whats-new-post__summary').should('have.text', 'Summary')
    })
  })

  context('Help', () => {
    it('should display help info', () => {
      const page = Page.verifyOnPage(IndexPage)
      page.help().heading().should('be.visible').and('contain.text', 'Get help with DPS')
      page.help().subHeading1().should('be.visible').and('contain.text', 'Contact the helpdesk')
      page.help().subHeading2().should('be.visible').and('contain.text', 'Tell us what you think')
    })
  })
})

context('Homepage - no global search', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubRollCount')
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')

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
})

context('Homepage - no active caseload', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'MOR', currentlyActive: false, description: 'Moorland', type: '' },
      ],
    })
    cy.task('stubRollCount', { prisonCode: 'MOR' })
    cy.task('stubRollCountUnassigned', 'MOR')
    cy.task('stubMovements', 'MOR')
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')
    cy.task('stubSetActiveCaseload')

    cy.signIn()
    cy.visit('/')
  })

  it('should set the first caseload as active', () => {
    const page = Page.verifyOnPage(IndexPage)
    page.search().viewAllLink().should('be.visible').and('contain.text', 'Moorland')
  })
})

context('Homepage - No caseloads', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [],
    })
    cy.task('stubWhatsNewPosts')
    cy.task('stubOutageBanner')

    cy.signIn()
    cy.visit('/')
  })

  it('Homepage is visible', () => {
    Page.verifyOnPage(IndexPage)
  })
})
