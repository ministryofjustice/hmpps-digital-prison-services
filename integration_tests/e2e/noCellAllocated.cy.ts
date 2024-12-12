import Page from '../pages/page'
import { Role } from '../../server/enums/role'
import NoCellAllocatedPage from '../pages/NoCellAllocated'
import { prisonerSearchMock } from '../../server/test/mocks/prisonerSearchMock'

function visitPageWithRoles(roles: string[]) {
  cy.setupUserAuth({ roles })
  cy.setupComponentsData({
    caseLoads: [
      { caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: 'Moorland (HMP)', type: '' },
    ],
  })
  cy.signIn({ redirectPath: '/establishment-roll/no-cell-allocated' })
  cy.visit('/establishment-roll/no-cell-allocated')
}
context('In reception Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubPostAttributeSearch')
    cy.task('stubGetOffenderCellHistory', prisonerSearchMock[0].bookingId)
    cy.task('stubGetOffenderCellHistory', prisonerSearchMock[1].bookingId)
    cy.task('getUserDetailsList')
  })

  it('Page is visible', () => {
    visitPageWithRoles([`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`])

    Page.verifyOnPage(NoCellAllocatedPage)
  })

  it('should display a table row for each wing level assignedRollCount', () => {
    visitPageWithRoles([`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`])

    const page = Page.verifyOnPage(NoCellAllocatedPage)
    page.inReceptionRows().should('have.length', 2)

    page.inReceptionRows().first().find('td').eq(1).should('contain.text', 'Shannon, Eddie')
    page.inReceptionRows().first().find('td').eq(2).should('contain.text', 'A1234AB')
    page.inReceptionRows().first().find('td').eq(3).should('contain.text', '1-1-2')
    page.inReceptionRows().first().find('td').eq(4).should('contain.text', '00:00')
    page.inReceptionRows().first().find('td').eq(5).should('contain.text', 'Edwin Shannon')
  })

  it('should display allocation link if user has cell move', () => {
    visitPageWithRoles([`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`, `ROLE_${Role.CellMove}`])

    const page = Page.verifyOnPage(NoCellAllocatedPage)
    page.inReceptionRows().should('have.length', 2)

    page
      .inReceptionRows()
      .first()
      .find('td')
      .eq(6)
      .find('a[href="http://localhost:3002/prisoner/A1234AB/cell-move/search-for-cell"]')
      .should('contain.text', 'Allocate cell')
  })
})
