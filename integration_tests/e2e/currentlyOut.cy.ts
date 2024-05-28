import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import CurrentlyOutPage from '../pages/currentlyOut'

context('En Route Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`],
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubOutToday', '123')
    cy.task('stubPostSearchPrisonersById')
    cy.task('stubRecentMovements')
    cy.task('stubGetLocation')
    cy.signIn({ redirectPath: '/establishment-roll/123/currently-out' })
    cy.visit('/establishment-roll/123/currently-out')
  })

  it('Page is visible', () => {
    Page.verifyOnPage(CurrentlyOutPage)
  })

  it('should display a table row for each prisoner en-route', () => {
    const page = Page.verifyOnPage(CurrentlyOutPage)
    page.currentlyOutRows().should('have.length', 2)

    page.currentlyOutRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.currentlyOutRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.currentlyOutRows().first().find('td').eq(3).should('contain.text', '01/01/1980')
    page.currentlyOutRows().first().find('td').eq(4).should('contain.text', '1-1-1')
    page.currentlyOutRows().first().find('td').eq(5).should('contain.text', '')
    page.currentlyOutRows().first().find('td').eq(6).should('contain.text', 'Sheffield')
    page.currentlyOutRows().first().find('td').eq(7).should('contain.text', 'Some Sheffield comment')
  })

  it('should display alerts and category if cat A', () => {
    const page = Page.verifyOnPage(CurrentlyOutPage)
    page.currentlyOutRows().should('have.length', 2)

    page.currentlyOutRows().eq(1).find('td').eq(5).should('contain.text', 'Hidden disability')
    page.currentlyOutRows().eq(1).find('td').eq(5).should('contain.text', 'CAT A')
  })
})
