import Page from './page'

export default class DietaryRequirementsPage extends Page {
  constructor() {
    super(`People with dietary requirements in Prison Name`)
  }

  dietaryRequirements = () => ({
    row: (i: number) => ({
      nameAndPrisonNumber: () => cy.get('table tbody tr').eq(i).find('td').eq(0),
      location: () => cy.get('table tbody tr').eq(i).find('td').eq(1),
      dietaryRequirements: () => ({
        medical: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="medical-requirements"]'),
        foodAllergies: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="food-allergies"]'),
        personal: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="personal-requirements"]'),
      }),
    }),
    sorting: () => ({
      nameAndNumber: () => cy.get('table thead th').eq(0),
      location: () => cy.get('table thead th').eq(1),
    }),
  })
}
