Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request('/')
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})

Cypress.Commands.add('setupUserAuth', ({ roles, caseLoads, activeCaseLoadId = 'LEI', locations } = {}) => {
  cy.task('stubSignIn', roles)
  cy.task('stubUserCaseLoads', caseLoads)
  cy.task('stubAuthUser', { activeCaseLoadId })
  cy.task('stubUserLocations', locations)
})
