import Page from '../pages/page'
import EstablishmentRollPage from '../pages/EstablishmentRoll'
import { Role } from '../../server/enums/role'

context('Establishment Roll Page', () => {
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
      page.todaysStats().unlockRoll().should('contain.text', '1015')
      page.todaysStats().currentPopulation().should('contain.text', '1023')
      page.todaysStats().arrivedToday().should('contain.text', '17')
      page.todaysStats().inReception().should('contain.text', '23')
      page.todaysStats().stillToArrive().should('contain.text', '1')
      page.todaysStats().outToday().should('contain.text', '9')
      page.todaysStats().noCellAllocated().should('contain.text', '31')
    })

    it('should display a table row for each assignedRollCount', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)
      page.assignedRollCountFirstRow().should('have.length', 6)

      page.assignedRollCountFirstRow().first().find('td').eq(0).should('contain.text', 'A')
      page.assignedRollCountFirstRow().first().find('td').eq(1).should('contain.text', '76')
      page.assignedRollCountFirstRow().first().find('td').eq(2).should('contain.text', '900')
      page.assignedRollCountFirstRow().first().find('td').eq(3).should('contain.text', '5')
      page.assignedRollCountFirstRow().first().find('td').eq(4).should('contain.text', '60')
      page.assignedRollCountFirstRow().first().find('td').eq(5).should('contain.text', '-16')
      page.assignedRollCountFirstRow().first().find('td').eq(6).should('contain.text', '0')
    })

    it('should display a table row for totals', () => {
      const page = Page.verifyOnPage(EstablishmentRollPage)

      page.assignedRollCountFirstRow().last().find('td').eq(0).should('contain.text', 'Totals')
      page.assignedRollCountFirstRow().last().find('td').eq(1).should('contain.text', '332')
      page.assignedRollCountFirstRow().last().find('td').eq(2).should('contain.text', '1000')
      page.assignedRollCountFirstRow().last().find('td').eq(3).should('contain.text', '5')
      page.assignedRollCountFirstRow().last().find('td').eq(4).should('contain.text', '312')
      page.assignedRollCountFirstRow().last().find('td').eq(5).should('contain.text', '-20')
      page.assignedRollCountFirstRow().last().find('td').eq(6).should('contain.text', '0')
    })
  })
})
