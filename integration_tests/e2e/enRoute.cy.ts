import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import EnRoutePage from '../pages/enRoute'

context('En Route Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubMovementsEnRoute')
    cy.task('stubPostSearchPrisonersById')
    cy.signIn({ redirectPath: '/establishment-roll/en-route' })
    cy.visit('/establishment-roll/en-route')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(EnRoutePage)
  })

  it('should display a table row for each prisoner en-route', () => {
    const page = Page.verifyOnPage(EnRoutePage)
    page.enRouteRows().should('have.length', 2)

    page.enRouteRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.enRouteRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.enRouteRows().first().find('td').eq(3).should('contain.text', '01/01/1980')
    page.enRouteRows().first().find('td').eq(4).should('contain.text', '11:0025/12/2023')
    page.enRouteRows().first().find('td').eq(5).should('contain.text', 'Leeds')
    page.enRouteRows().first().find('td').eq(6).should('contain.text', 'Normal Transfer')
    page.enRouteRows().first().find('td').eq(7).should('contain.text', '')
  })

  it('should display alerts and category if cat A', () => {
    const page = Page.verifyOnPage(EnRoutePage)
    page.enRouteRows().should('have.length', 2)

    page.enRouteRows().eq(1).find('td').eq(7).should('contain.text', 'Hidden disability')
    page.enRouteRows().eq(1).find('td').eq(7).should('contain.text', 'CAT A')
  })
})
