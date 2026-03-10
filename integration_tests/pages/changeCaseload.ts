import Page from './page'

export default class ChangeCaseloadPage extends Page {
  constructor() {
    super('Change your location')
  }

  select = () => cy.get('#changeCaseloadSelect')

  submitButton = () => cy.contains('button', 'Submit')
}
