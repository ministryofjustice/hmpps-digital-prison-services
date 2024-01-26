Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add(
  'setupUserAuth',
  ({
    roles,
    caseLoads = [
      { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
    ],
    activeCaseLoadId = 'LEI',
    locations,
  } = {}) => {
    cy.task('stubSignIn', roles)
    cy.task('stubUserCaseLoads', caseLoads)
    cy.task('stubAuthUser', { activeCaseLoadId })
    cy.task('stubUserLocations', locations)
    cy.task('stubGetStaffRoles')
  },
)
