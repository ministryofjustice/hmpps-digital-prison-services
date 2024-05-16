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
    cy.task('stubRollCount', { payload: assignedRollCountWithSpursMock, query: '?wingOnly=false' })
    cy.task('stubRollCountUnassigned')
    cy.task('stubMovements')
    cy.task('stubEnrouteRollCount')
    cy.task('stubGetLocationsForPrison')
    cy.task('getAttributesForLocation')
    cy.signIn({ redirectPath: '/establishment-roll' })
    cy.visit('/establishment-roll')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(EstablishmentRollPage)
  })

  context('Outage Banner', () => {
    it('should display todays stats', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)
      page.todaysStats().unlockRoll().should('contain.text', '1815')
      page.todaysStats().currentPopulation().should('contain.text', '1823')
      page.todaysStats().arrivedToday().should('contain.text', '17')
      page.todaysStats().inReception().should('contain.text', '23')
      page.todaysStats().stillToArrive().should('contain.text', '1')
      page.todaysStats().outToday().should('contain.text', '9')
      page.todaysStats().noCellAllocated().should('contain.text', '31')
    })

    it('should display a table row for each wing level assignedRollCount', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)
      page.assignedRollCountRows().should('have.length', 6)

      page.assignedRollCountRows().first().find('td').eq(0).should('contain.text', 'A')
      page.assignedRollCountRows().first().find('td').eq(1).should('contain.text', '76')
      page.assignedRollCountRows().first().find('td').eq(2).should('contain.text', '900')
      page.assignedRollCountRows().first().find('td').eq(3).should('contain.text', '5')
      page.assignedRollCountRows().first().find('td').eq(4).should('contain.text', '60')
      page.assignedRollCountRows().first().find('td').eq(5).should('contain.text', '-16')
      page.assignedRollCountRows().first().find('td').eq(6).should('contain.text', '0')
    })

    it('should display a table row for totals', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)

      page.assignedRollCountRows().last().find('td').eq(0).should('contain.text', 'Totals')
      page.assignedRollCountRows().last().find('td').eq(1).should('contain.text', '152')
      page.assignedRollCountRows().last().find('td').eq(2).should('contain.text', '1800')
      page.assignedRollCountRows().last().find('td').eq(3).should('contain.text', '10')
      page.assignedRollCountRows().last().find('td').eq(4).should('contain.text', '120')
      page.assignedRollCountRows().last().find('td').eq(5).should('contain.text', '-32')
      page.assignedRollCountRows().last().find('td').eq(6).should('contain.text', '0')
    })

    it('should reveal spurs and landings when click on link', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)

      page.assignedRollCountRows().eq(0).find('td').eq(0).should('contain.text', 'A').should('be.visible')
      page.assignedRollCountRows().eq(1).find('td').eq(0).should('contain.text', 'Spur A1').should('not.be.visible')
      page.assignedRollCountRows().eq(2).find('td').eq(0).should('contain.text', 'Landing A1X').should('not.be.visible')
      page.assignedRollCountRows().eq(3).find('td').eq(0).should('contain.text', 'B').should('be.visible')
      page.assignedRollCountRows().eq(4).find('td').eq(0).should('contain.text', 'LANDING BY').should('not.be.visible')

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
      cy.task('stubGetLocation', { locationId: 1, payload: { ...locationMock, description: 'WING 1' } })
      cy.task('stubGetLocation', { locationId: 2, payload: { ...locationMock, description: 'Spur 1' } })
      cy.task('stubGetLocation', { locationId: 3, payload: { ...locationMock, description: 'Landing 1' } })
      cy.task('stubRollCount', {
        payload: assignedRollCountWithSpursMock,
        query: '?wingOnly=false&showCells=true&parentLocationId=3',
      })

      const page = Page.verifyOnPage(EstablishmentRollPage)

      const wing1Reveal = page.assignedRollCountRows().eq(0).find('td').eq(0).find('a')
      wing1Reveal.click()
      page.assignedRollCountRows().eq(2).find('td').eq(0).find('a').click()

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
      cy.task('stubGetLocation', { locationId: 4, payload: { ...locationMock, description: 'WING 1' } })
      cy.task('stubGetLocation', { locationId: 5, payload: { ...locationMock, description: 'Landing 1' } })
      cy.task('stubRollCount', {
        payload: assignedRollCountWithSpursMock,
        query: '?wingOnly=false&showCells=true&parentLocationId=5',
      })

      const page = Page.verifyOnPage(EstablishmentRollPage)

      const wing2Reveal = page.assignedRollCountRows().eq(3).find('td').eq(0).find('a')
      wing2Reveal.click()
      page.assignedRollCountRows().eq(4).find('td').eq(0).find('a').click()

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
})
