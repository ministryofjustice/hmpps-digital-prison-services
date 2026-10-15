import Page from '../pages/page'
import PrisonerSearch from '../pages/prisonerSearch'
import { prisonerMockDataA } from '../mockApis/prisonerSearch'

context('Prisoner search', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [`ROLE_PRISON`] })
    cy.setupComponentsData({
      caseLoads: [
        { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
      ],
    })
    cy.task('stubUserCaseLoads', [
      {
        caseLoadId: 'LEI',
        currentlyActive: true,
        description: '',
        type: '',
        caseloadFunction: '',
      },
    ])
    cy.task('stubLocationSearch', { prisonId: 'LEI' })
    cy.signIn({ redirectPath: '/prisoner-search' })
  })

  it('Should load the page', () => {
    const page = Page.verifyOnPage(PrisonerSearch)
    page.prisoners().rows().should('have.length', 1)
    page.prisoners().row(0).photo().find('img').should('have.attr', 'src').should('include', 'imageId=1234')
    page.prisoners().row(0).name().should('contain.text', 'Saunders, John')
    page.prisoners().row(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/G6123VU')
    page.prisoners().row(0).prisonNumber().should('contain.text', 'G6123VU')
    page.prisoners().row(0).incentiveLevel().should('contain.text', 'Standard')
    const ageInYears = Math.round((Date.now() - Date.parse(prisonerMockDataA.dateOfBirth)) / 1000 / 60 / 60 / 24 / 365)
    page.prisoners().row(0).age().should('contain.text', ageInYears.toString())
    page.prisoners().row(0).alerts().should('contain.text', 'PEEP')
  })
})
