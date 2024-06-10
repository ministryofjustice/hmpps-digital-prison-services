import Page from '../pages/page'
import EstablishmentRollPage from '../pages/EstablishmentRoll'
import { Role } from '../../server/enums/role'
import { assignedRollCountWithSpursMock } from '../../server/mocks/rollCountMock'
import LandingRollPage from '../pages/LandingRoll'
import { locationMock } from '../../server/mocks/locationMock'

context('Establishment Roll Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubPrisonRollCount')
    cy.signIn({ redirectPath: '/establishment-roll' })
    cy.visit('/establishment-roll')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(EstablishmentRollPage)
  })

  it('should display todays stats', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)
    page.todaysStats().unlockRoll().should('contain.text', '100')
    page.todaysStats().currentPopulation().should('contain.text', '200')
    page.todaysStats().arrivedToday().should('contain.text', '300')
    page.todaysStats().inReception().should('contain.text', '400')
    page.todaysStats().stillToArrive().should('contain.text', '500')
    page.todaysStats().outToday().should('contain.text', '600')
    page.todaysStats().noCellAllocated().should('contain.text', '700')
  })

  it('should display a table row for each wing level assignedRollCount', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)
    page.assignedRollCountRows().should('have.length', 7)

    page.assignedRollCountRows().first().find('td').eq(0).should('contain.text', 'B Wing')
    page.assignedRollCountRows().first().find('td').eq(1).should('contain.text', '194')
    page.assignedRollCountRows().first().find('td').eq(2).should('contain.text', '192')
    page.assignedRollCountRows().first().find('td').eq(3).should('contain.text', '1')
    page.assignedRollCountRows().first().find('td').eq(4).should('contain.text', '470')
    page.assignedRollCountRows().first().find('td').eq(5).should('contain.text', '276')
    page.assignedRollCountRows().first().find('td').eq(6).should('contain.text', '0')
  })

  it('should display a table row for totals', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)

    page.assignedRollCountRows().last().find('td').eq(0).should('contain.text', 'Totals')
    page.assignedRollCountRows().last().find('td').eq(1).should('contain.text', '10')
    page.assignedRollCountRows().last().find('td').eq(2).should('contain.text', '20')
    page.assignedRollCountRows().last().find('td').eq(3).should('contain.text', '30')
    page.assignedRollCountRows().last().find('td').eq(4).should('contain.text', '40')
    page.assignedRollCountRows().last().find('td').eq(5).should('contain.text', '50')
    page.assignedRollCountRows().last().find('td').eq(6).should('contain.text', '60')
  })

  it('should reveal spurs and landings when click on link', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)

    page.assignedRollCountRows().eq(0).find('td').eq(0).should('contain.text', 'B Wing').should('be.visible')
    page.assignedRollCountRows().eq(1).find('td').eq(0).should('contain.text', '1').should('not.be.visible')
    page.assignedRollCountRows().eq(2).find('td').eq(0).should('contain.text', '2').should('not.be.visible')
    page.assignedRollCountRows().eq(3).find('td').eq(0).should('contain.text', 'C Wing').should('be.visible')
    page.assignedRollCountRows().eq(4).find('td').eq(0).should('contain.text', 'C-1').should('not.be.visible')
    page.assignedRollCountRows().eq(5).find('td').eq(0).should('contain.text', 'C-1-1').should('not.be.visible')

    const wing1Reveal = page.assignedRollCountRows().eq(0).find('td').eq(0).find('a')
    wing1Reveal.click()
    page.assignedRollCountRows().eq(1).find('td').eq(0).should('be.visible')
    page.assignedRollCountRows().eq(2).find('td').eq(0).should('be.visible')

    wing1Reveal.click()
    page.assignedRollCountRows().eq(1).find('td').eq(0).should('not.be.visible')
    page.assignedRollCountRows().eq(2).find('td').eq(0).should('not.be.visible')

    const wing2Reveal = page.assignedRollCountRows().eq(3).find('td').eq(0).find('a')
    wing2Reveal.click()
    page.assignedRollCountRows().eq(4).find('td').eq(0).should('be.visible')

    wing2Reveal.click()
    page.assignedRollCountRows().eq(4).find('td').eq(0).should('not.be.visible')
  })

  it('should show link to landing pages when wing has spur', () => {
    cy.task('stubGetLocation', { locationId: 20000, payload: { ...locationMock, description: 'WING 1' } })
    cy.task('stubGetLocation', { locationId: 100, payload: { ...locationMock, description: 'Spur 1' } })
    cy.task('stubGetLocation', { locationId: 12729, payload: { ...locationMock, description: 'Landing 1' } })
    cy.task('stubRollCount', {
      payload: assignedRollCountWithSpursMock,
      query: '?wingOnly=false&showCells=true&parentLocationId=12729',
    })

    const page = Page.verifyOnPage(EstablishmentRollPage)

    const wing2Reveal = page.assignedRollCountRows().eq(3).find('td').eq(0).find('a')
    wing2Reveal.click()
    page.assignedRollCountRows().eq(5).find('td').eq(0).find('a').click()

    const landingPage = Page.verifyOnPageWithTitle(LandingRollPage, 'WING 1 - Spur 1 - Landing 1')

    landingPage.rollCountRows().should('have.length', 5)

    landingPage.rollCountRows().eq(0).find('td').eq(0).should('contain.text', 'A')
    landingPage.rollCountRows().eq(1).find('td').eq(0).should('contain.text', 'Spur A1')
    landingPage.rollCountRows().eq(2).find('td').eq(0).should('contain.text', 'Landing A1X')
    landingPage.rollCountRows().eq(3).find('td').eq(0).should('contain.text', 'B')
    landingPage.rollCountRows().eq(4).find('td').eq(0).should('contain.text', 'LANDING BY')

    landingPage.rollCountRows().first().find('td').eq(1).should('contain.text', '76')
    landingPage.rollCountRows().first().find('td').eq(2).should('contain.text', '900')
    landingPage.rollCountRows().first().find('td').eq(3).should('contain.text', '5')
    landingPage.rollCountRows().first().find('td').eq(4).should('contain.text', '60')
    landingPage.rollCountRows().first().find('td').eq(5).should('contain.text', '-16')
  })

  it('should show link to landing pages when wing does not have spur', () => {
    cy.task('stubGetLocation', { locationId: 10000, payload: { ...locationMock, description: 'WING 1' } })
    cy.task('stubGetLocation', { locationId: 12714, payload: { ...locationMock, description: 'Landing 1' } })
    cy.task('stubRollCount', {
      payload: assignedRollCountWithSpursMock,
      query: '?wingOnly=false&showCells=true&parentLocationId=12714',
    })

    const page = Page.verifyOnPage(EstablishmentRollPage)

    const wing2Reveal = page.assignedRollCountRows().eq(0).find('td').eq(0).find('a')
    wing2Reveal.click()
    page.assignedRollCountRows().eq(1).find('td').eq(0).find('a').click()

    const landingPage = Page.verifyOnPageWithTitle(LandingRollPage, 'WING 1 - Landing 1')

    landingPage.rollCountRows().should('have.length', 5)

    landingPage.rollCountRows().eq(0).find('td').eq(0).should('contain.text', 'A')
    landingPage.rollCountRows().eq(1).find('td').eq(0).should('contain.text', 'Spur A1')
    landingPage.rollCountRows().eq(2).find('td').eq(0).should('contain.text', 'Landing A1X')
    landingPage.rollCountRows().eq(3).find('td').eq(0).should('contain.text', 'B')
    landingPage.rollCountRows().eq(4).find('td').eq(0).should('contain.text', 'LANDING BY')

    landingPage.rollCountRows().first().find('td').eq(1).should('contain.text', '76')
    landingPage.rollCountRows().first().find('td').eq(2).should('contain.text', '900')
    landingPage.rollCountRows().first().find('td').eq(3).should('contain.text', '5')
    landingPage.rollCountRows().first().find('td').eq(4).should('contain.text', '60')
    landingPage.rollCountRows().first().find('td').eq(5).should('contain.text', '-16')
  })
})
