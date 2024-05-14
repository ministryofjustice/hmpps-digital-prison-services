import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import OutTodayPage from '../pages/outToday'

context('Out Today Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubMovementsOut')
    cy.task('stubPostSearchPrisonersById')
    cy.signIn({ redirectPath: '/establishment-roll/out-today' })
    cy.visit('/establishment-roll/out-today')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(OutTodayPage)
  })

  it('should display a table row for each prisoner returned from movementsOut', () => {
    const page = Page.verifyOnPage(OutTodayPage)
    page.outTodayRows().should('have.length', 2)

    page.outTodayRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.outTodayRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.outTodayRows().first().find('td').eq(3).should('contain.text', '01/01/1980')
    page.outTodayRows().first().find('td').eq(4).should('contain.text', '11:00')
    page.outTodayRows().first().find('td').eq(5).should('contain.text', 'Another transfer')
    page.outTodayRows().first().find('td').eq(6).should('contain.text', '')
  })

  it('should display alerts and category if cat A', () => {
    const page = Page.verifyOnPage(OutTodayPage)
    page.outTodayRows().should('have.length', 2)

    page.outTodayRows().eq(1).find('td').eq(6).should('contain.text', 'Hidden disability')
    page.outTodayRows().eq(1).find('td').eq(6).should('contain.text', 'CAT A')
  })
})
