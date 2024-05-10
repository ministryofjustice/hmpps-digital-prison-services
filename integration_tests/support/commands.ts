Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add(
  'setupUserAuth',
  (
    options = {
      caseLoads: [
        {
          caseLoadId: 'LEI',
          currentlyActive: true,
          description: '',
          type: '',
          caseloadFunction: '',
        },
      ],
    },
  ) => {
    cy.task('stubSignIn', options)
    cy.task('stubUserCaseLoads', options.caseLoads)
    cy.task('stubUserLocations', options.locations)
    cy.task('stubGetStaffRoles')
  },
)
