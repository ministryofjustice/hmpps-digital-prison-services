import Page from './page'

export default class DietaryRequirementsPage extends Page {
  constructor() {
    super(`People with dietary requirements in Leeds (HMP)`)
  }

  dietaryRequirements = () => ({
    row: (i: number) => ({
      nameAndPrisonNumber: () => cy.get('table tbody tr').eq(i).find('td').eq(0),
      location: () => cy.get('table tbody tr').eq(i).find('td').eq(1),
      dietaryRequirements: () => ({
        medical: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="medical-requirements"]'),
        foodAllergies: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="food-allergies"]'),
        personal: () => cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="personal-requirements"]'),
        cateringInstructions: () =>
          cy.get('table tbody tr').eq(i).find('td').eq(2).find('[data-qa="catering-instructions"]'),
      }),
    }),
    sorting: () => ({
      nameAndNumber: () => cy.get('table thead th').eq(0),
      location: () => cy.get('table thead th').eq(1),
    }),
  })

  filters = () => ({
    personalisedDiet: () => ({
      heading: () => cy.get('[data-qa="filter-group-personalDiet"').find('legend'),
      options: () => cy.get('[data-qa="filter-group-personalDiet"').find('.govuk-checkboxes__item'),
    }),
    medicalDiet: () => ({
      heading: () => cy.get('[data-qa="filter-group-medicalDiet"').find('legend'),
      options: () => cy.get('[data-qa="filter-group-medicalDiet"').find('.govuk-checkboxes__item'),
    }),
    foodAllergies: () => ({
      heading: () => cy.get('[data-qa="filter-group-foodAllergies"').find('legend'),
      options: () => cy.get('[data-qa="filter-group-foodAllergies"').find('.govuk-checkboxes__item'),
    }),
  })
}
