export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new () => T): T {
    return new constructor()
  }

  static verifyOnPageWithTitle<T>(constructor: new (title: string) => T, title: string): T {
    return new constructor(title)
  }

  constructor(private readonly title: string) {
    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manage-account-link]')

  changeCaseloadItem = (): PageElement => cy.get('.hmpps-header__caseload')

  changeCaseload = (): PageElement => cy.get('[data-qa=change-caseload-link]')
}
