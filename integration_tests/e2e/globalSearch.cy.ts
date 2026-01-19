import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/enums/role'
import GlobalSearchResults from '../pages/globalSearchResults'

context('Global search', () => {
  context('Without the global search role', () => {
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
    })

    const urls = ['/global-search', '/global-search/results']
    urls.forEach(url => {
      it(`Does not load the page (${url})`, () => {
        cy.signIn({ redirectPath: url })
        Page.verifyOnPage(NotFoundPage)
      })
    })
  })

  context('With the global search role', () => {
    context('Without the licences role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({ roles: [`ROLE_PRISON`, `ROLE_${Role.GlobalSearch}`] })
        cy.setupComponentsData({
          caseLoads: [
            { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
            { caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: 'Moorland', type: '' },
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
        cy.task('stubGlobalSearch')
        cy.signIn({ redirectPath: `/global-search/results?searchText=smith` })
      })

      it('Should load the page', () => {
        const page = Page.verifyOnPage(GlobalSearchResults)
        page.prisoners().rows().should('have.length', 1)
        page.prisoners().row(0).photo().find('img').should('have.attr', 'src').should('include', 'imageId=1234')
        page.prisoners().row(0).name().should('contain.text', 'Saunders, John')
        page.prisoners().row(0).name().find('a').should('have.attr', 'href').should('include', '/prisoner/G6123VU')
        page.prisoners().row(0).prisonNumber().should('contain.text', 'G6123VU')
        page.prisoners().row(0).dateOfBirth().should('contain.text', '12/10/1990')
        page.prisoners().row(0).location().should('contain.text', 'Moorland (HMP & YOI)')
        page.prisoners().row(0).workingName().should('contain.text', 'Saunders, John')
      })
    })

    context('With the licences roles', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: [
            `ROLE_PRISON`,
            `ROLE_${Role.GlobalSearch}`,
            `ROLE_${Role.LicencesReadOnly}`,
            `ROLE_${Role.LicencesVary}`,
          ],
        })
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
        cy.task('stubGlobalSearch')
        cy.signIn({ redirectPath: `/global-search/results?searchText=smith` })
      })

      it('Should load the page and display the licences link', () => {
        const page = Page.verifyOnPage(GlobalSearchResults)
        page.prisoners().row(0).licences().should('contain.text', 'Update')
      })
    })
  })
})
