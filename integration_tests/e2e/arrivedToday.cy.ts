import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import ArrivedTodayPage from '../pages/arrivedToday'

context('Arrived Today Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`] })
    cy.setupComponentsData()
    cy.task('stubMovementsIn')
    cy.task('stubPostSearchPrisonersById')
    cy.signIn({ redirectPath: '/establishment-roll/arrived-today' })
    cy.visit('/establishment-roll/arrived-today')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(ArrivedTodayPage)
  })

  it('should display a table row for each wing level assignedRollCount', () => {
    const page = Page.verifyOnPage(ArrivedTodayPage)
    page.arrivedTodayRows().should('have.length', 2)

    page.arrivedTodayRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.arrivedTodayRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.arrivedTodayRows().first().find('td').eq(3).should('contain.text', '01/01/1980')
    page.arrivedTodayRows().first().find('td').eq(4).should('contain.text', '1-1-1')
    page.arrivedTodayRows().first().find('td').eq(5).should('contain.text', '10:30')
    page.arrivedTodayRows().first().find('td').eq(6).should('contain.text', 'Cookham Wood')
    page.arrivedTodayRows().first().find('td').eq(7).should('contain.text', '')
  })

  it('should display alerts and category if cat A', () => {
    const page = Page.verifyOnPage(ArrivedTodayPage)
    page.arrivedTodayRows().should('have.length', 2)

    page.arrivedTodayRows().eq(1).find('td').eq(7).should('contain.text', 'Hidden disability')
    page.arrivedTodayRows().eq(1).find('td').eq(7).should('contain.text', 'CAT A')
  })
})
