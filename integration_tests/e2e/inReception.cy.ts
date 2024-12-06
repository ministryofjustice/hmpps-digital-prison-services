import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import InReceptionPage from '../pages/InReception'

context('In reception Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`] })
    cy.setupComponentsData()
    cy.task('stubMovementsInReception')
    cy.task('stubRecentMovements')
    cy.task('stubPostSearchPrisonersById')
    cy.signIn({ redirectPath: '/establishment-roll/in-reception' })
    cy.visit('/establishment-roll/in-reception')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(InReceptionPage)
  })

  it('should display a table row for each wing level assignedRollCount', () => {
    const page = Page.verifyOnPage(InReceptionPage)
    page.inReceptionRows().should('have.length', 2)

    page.inReceptionRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.inReceptionRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.inReceptionRows().first().find('td').eq(3).should('contain.text', '01/01/1980')
    page.inReceptionRows().first().find('td').eq(4).should('contain.text', '11:00')
    page.inReceptionRows().first().find('td').eq(5).should('contain.text', 'Leeds')
    page.inReceptionRows().first().find('td').eq(6).should('contain.text', '')
  })

  it('should display alerts and category if cat A', () => {
    const page = Page.verifyOnPage(InReceptionPage)
    page.inReceptionRows().should('have.length', 2)

    page.inReceptionRows().eq(1).find('td').eq(6).should('contain.text', 'Hidden disability')
    page.inReceptionRows().eq(1).find('td').eq(6).should('contain.text', 'CAT A')
  })
})
