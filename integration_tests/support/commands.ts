Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add('setupUserAuth', (options = {}) => {
  cy.task('stubSignIn', options)
  cy.task('stubUserLocations', options.locations)
})

Cypress.Commands.add('setupComponentsData', (options = {}) => {
  cy.task('stubFeComponents', options)
  cy.task('stubUserCaseLoads', options.caseLoads)
})
