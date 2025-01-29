import { Role } from '../../server/enums/role'
import DietaryRequirementsPage from '../pages/dietaryRequirements'
import Page from '../pages/page'

context('Currently Out Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`, `ROLE_${Role.DpsApplicationDeveloper}`] })
    cy.task('stubHealthAndMedicationForPrison', 'LEI')
    cy.setupComponentsData({
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
  })

  it('Page is visible for mock data', () => {
    cy.signIn({ redirectPath: `/dietary-requirements` })
    cy.visit(`/dietary-requirements`)
    Page.verifyOnPage(DietaryRequirementsPage)
  })

  it('Displays the prisoner information', () => {
    cy.signIn({ redirectPath: `/dietary-requirements` })
    cy.visit(`/dietary-requirements`)
    const page = Page.verifyOnPage(DietaryRequirementsPage)
    page.dietaryRequirements().row(0).nameAndPrisonNumber().should('include.text', 'Richard Smith')
    page.dietaryRequirements().row(0).nameAndPrisonNumber().should('include.text', 'G4879UP')
    page.dietaryRequirements().row(0).location().should('include.text', 'C-3-010')
    page.dietaryRequirements().row(0).dietaryRequirements().medical().should('include.text', 'Nutrient Deficiency')
    page.dietaryRequirements().row(0).dietaryRequirements().foodAllergies().should('include.text', 'Egg')
    page.dietaryRequirements().row(2).dietaryRequirements().personal().should('include.text', 'Kosher')
  })

  context('Sorting', () => {
    it('Defaults to no sorting', () => {
      cy.signIn({ redirectPath: `/dietary-requirements` })
      cy.visit(`/dietary-requirements`)
      const page = Page.verifyOnPage(DietaryRequirementsPage)
      page.dietaryRequirements().sorting().nameAndNumber().should('have.attr', 'aria-sort', 'none')
      page.dietaryRequirements().sorting().location().should('have.attr', 'aria-sort', 'none')
    })

    it('Allows sorting', () => {
      cy.signIn({ redirectPath: `/dietary-requirements` })
      cy.visit(`/dietary-requirements`)
      const page = Page.verifyOnPage(DietaryRequirementsPage)
      page.dietaryRequirements().sorting().nameAndNumber().click()
      page.dietaryRequirements().sorting().nameAndNumber().should('have.attr', 'aria-sort', 'ascending')
      page.dietaryRequirements().sorting().location().should('have.attr', 'aria-sort', 'none')
      page.dietaryRequirements().sorting().nameAndNumber().click()
      page.dietaryRequirements().sorting().nameAndNumber().should('have.attr', 'aria-sort', 'descending')
      page.dietaryRequirements().sorting().location().click()
      page.dietaryRequirements().sorting().nameAndNumber().should('have.attr', 'aria-sort', 'none')
      page.dietaryRequirements().sorting().location().should('have.attr', 'aria-sort', 'ascending')
      page.dietaryRequirements().sorting().location().click()
      page.dietaryRequirements().sorting().location().should('have.attr', 'aria-sort', 'descending')
    })
  })
})
