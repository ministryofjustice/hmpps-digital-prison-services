import Page from '../pages/page'
import EstablishmentRollPage from '../pages/EstablishmentRoll'
import { Role } from '../../server/enums/role'
import LandingRollPage from '../pages/LandingRoll'
import { prisonRollCountForWingWithSpurMock } from '../../server/mocks/prisonRollCountForWingWithSpurMock'
import { prisonRollCountForWingNoSpurMock } from '../../server/mocks/prisonRollCountForWingNoSpurMock'

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
    page.todaysStats().arrivedToday().find('a[href="/establishment-roll/in-today"]').should('contain.text', '300')
    page.todaysStats().inReception().find('a[href="/establishment-roll/in-reception"]').should('contain.text', '400')
    page.todaysStats().stillToArrive().find('a[href="/establishment-roll/en-route"]').should('contain.text', '500')
    page.todaysStats().outToday().find('a[href="/establishment-roll/out-today"]').should('contain.text', '600')
    page
      .todaysStats()
      .noCellAllocated()
      .find('a[href="/establishment-roll/no-cell-allocated"]')
      .should('contain.text', '700')
  })

  it('should display a table row for each wing level assignedRollCount', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)
    page.assignedRollCountRows().should('have.length', 7)

    page.assignedRollCountRows().first().find('td').eq(0).should('contain.text', 'B Wing')
    page.assignedRollCountRows().first().find('td').eq(1).should('contain.text', '194')
    page.assignedRollCountRows().first().find('td').eq(2).should('contain.text', '192')
    page
      .assignedRollCountRows()
      .first()
      .find('td')
      .eq(3)
      .find('a[href="/establishment-roll/10000/currently-out"]')
      .should('contain.text', '1')
    page.assignedRollCountRows().first().find('td').eq(4).should('contain.text', '470')
    page.assignedRollCountRows().first().find('td').eq(5).should('contain.text', '276')
    page.assignedRollCountRows().first().find('td').eq(6).should('contain.text', '0')
  })

  it('should display a table row for totals', () => {
    const page = Page.verifyOnPage(EstablishmentRollPage)

    page.assignedRollCountRows().last().find('td').eq(0).should('contain.text', 'Totals')
    page.assignedRollCountRows().last().find('td').eq(1).should('contain.text', '10')
    page.assignedRollCountRows().last().find('td').eq(2).should('contain.text', '20')
    page
      .assignedRollCountRows()
      .last()
      .find('td')
      .eq(3)
      .find('a[href="/establishment-roll/total-currently-out"]')
      .should('contain.text', '30')
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
    cy.task('stubPrisonRollCountForLanding', { landingId: '20000', payload: prisonRollCountForWingWithSpurMock })

    const page = Page.verifyOnPage(EstablishmentRollPage)

    const wing2Reveal = page.assignedRollCountRows().eq(3).find('td').eq(0).find('a')
    wing2Reveal.click()
    page.assignedRollCountRows().eq(5).find('td').eq(0).find('a').click()

    const landingPage = Page.verifyOnPageWithTitle(LandingRollPage, '2 - 1 - B')

    landingPage.rollCountRows().should('have.length', 13)

    landingPage.rollCountRows().eq(0).find('td').eq(0).should('contain.text', '013')
    landingPage.rollCountRows().eq(1).find('td').eq(0).should('contain.text', '014')
    landingPage.rollCountRows().eq(2).find('td').eq(0).should('contain.text', '015')

    landingPage.rollCountRows().first().find('td').eq(1).should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(2).should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(3).should('contain.text', '0')
    landingPage.rollCountRows().first().find('td').eq(4).should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(5).should('contain.text', '0')
  })

  it('should show link to landing pages when wing does not have spur', () => {
    cy.task('stubPrisonRollCountForLanding', { landingId: '10000', payload: prisonRollCountForWingNoSpurMock })

    const page = Page.verifyOnPage(EstablishmentRollPage)

    const wing2Reveal = page.assignedRollCountRows().eq(0).find('td').eq(0).find('a')
    wing2Reveal.click()
    page.assignedRollCountRows().eq(2).find('td').eq(0).find('a').click()

    const landingPage = Page.verifyOnPageWithTitle(LandingRollPage, 'E - 5')

    landingPage.rollCountRows().should('have.length', 34)

    landingPage.rollCountRows().eq(0).find('td').eq(0).should('contain.text', '003')
    landingPage.rollCountRows().eq(1).find('td').eq(0).should('contain.text', '004')
    landingPage.rollCountRows().eq(2).find('td').eq(0).should('contain.text', '005')

    landingPage.rollCountRows().first().find('td').eq(1).should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(2).should('contain.text', '1')
    landingPage
      .rollCountRows()
      .first()
      .find('td')
      .eq(3)
      .find('a[href="/establishment-roll/13138/currently-out"]')
      .should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(4).should('contain.text', '1')
    landingPage.rollCountRows().first().find('td').eq(5).should('contain.text', '0')
  })
})
