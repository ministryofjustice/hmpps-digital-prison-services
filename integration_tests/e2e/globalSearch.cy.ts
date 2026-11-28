import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'
import GlobalSearchResults from '../pages/globalSearchResults'
import type Prisoner from '../../server/data/interfaces/prisoner'
import { Role } from '../../server/enums/role'
import { prisonerMockDataA } from '../mockApis/prisonerSearch'

context('Global search', () => {
  context('Without the global search role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
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
    // setup prisoners:
    // - unknown location
    const prisoners: Prisoner[] = [
      // in caseloads
      prisonerMockDataA,
      // in prison, outside caseloads
      {
        ...prisonerMockDataA,
        prisonerNumber: 'A1111AA',
        inOutStatus: 'IN',
        status: 'ACTIVE IN',
        prisonId: 'BXI',
        prisonName: 'Brixton (HMP)',
        locationDescription: 'Brixton (HMP)',
      },
      // in transfer
      {
        ...prisonerMockDataA,
        prisonerNumber: 'A2222AA',
        inOutStatus: 'TRN',
        status: 'TRN',
        prisonId: 'TRN',
        prisonName: 'Transfer',
        locationDescription: 'Transfer',
      },
      // released
      {
        ...prisonerMockDataA,
        prisonerNumber: 'A3333AA',
        inOutStatus: 'OUT',
        status: 'INACTIVE OUT',
        prisonId: 'OUT',
        prisonName: 'OUT',
        locationDescription: 'Outside - released from Moorland (HMP & YOI)',
      },
    ]

    beforeEach(() => {
      // user has LEI (active) and MDI caseloads
      cy.setupComponentsData({
        caseLoads: [
          { caseloadFunction: '', caseLoadId: 'LEI', currentlyActive: true, description: 'Leeds (HMP)', type: '' },
          { caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: false, description: 'Moorland', type: '' },
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
      cy.task('stubGlobalSearch', { prisoners })
      cy.task('stubCheckHighProfilePrisoners', {
        prisonerNumbersToCheck: prisoners.map(prisoner => prisoner.prisonerNumber),
      })
    })

    context('Without the licences role', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: ['ROLE_PRISON', `ROLE_${Role.GlobalSearch}`] })
      })

      it('Should load the page', () => {
        cy.signIn({ redirectPath: '/global-search/results?searchText=SAUNDERS' })

        const page = Page.verifyOnPage(GlobalSearchResults)
        page.prisoners.rows.should('have.length', 4)

        page.prisoners.row(0).photo.find('img').should('have.attr', 'src').should('include', 'imageId=1234')
        page.prisoners.row(0).name.should('contain.text', 'Saunders, John')
        page.prisoners.row(0).name.find('a').should('have.attr', 'href').should('include', '/prisoner/G6123VU')
        page.prisoners.row(0).prisonNumber.should('contain.text', 'G6123VU')
        page.prisoners.row(0).dateOfBirth.should('contain.text', '12/10/1990')
        page.prisoners.row(0).location.should('contain.text', 'Moorland (HMP & YOI)')
        page.prisoners.row(0).workingName.should('contain.text', 'Saunders, John')
        page.prisoners.row(0).licences.should('be.empty')

        page.prisoners
          .row(1)
          .photo.find('img')
          .should('have.attr', 'src')
          .should('include', '/assets/images/prisoner-profile-image.png')
        page.prisoners.row(1).name.should('contain.text', 'Saunders, John')
        page.prisoners.row(1).name.find('a').should('have.attr', 'href').should('include', '/prisoner/A1111AA')
        page.prisoners.row(1).prisonNumber.should('contain.text', 'A1111AA')
        page.prisoners.row(1).dateOfBirth.should('contain.text', '12/10/1990')
        page.prisoners.row(1).location.should('contain.text', 'Brixton (HMP)')
        page.prisoners.row(1).workingName.should('contain.text', 'Saunders, John')
        page.prisoners.row(1).licences.should('be.empty')

        page.prisoners.row(2).photo.find('img').should('have.attr', 'src').should('include', 'imageId=1234')
        page.prisoners.row(2).name.should('contain.text', 'Saunders, John')
        page.prisoners.row(2).name.find('a').should('not.exist')
        page.prisoners.row(2).prisonNumber.should('contain.text', 'A2222AA')
        page.prisoners.row(2).dateOfBirth.should('contain.text', '12/10/1990')
        page.prisoners.row(2).location.should('contain.text', 'Transfer')
        page.prisoners.row(2).workingName.should('contain.text', 'Saunders, John')
        page.prisoners.row(2).licences.should('be.empty')

        page.prisoners
          .row(3)
          .photo.find('img')
          .should('have.attr', 'src')
          .should('include', '/assets/images/prisoner-profile-image.png')
        page.prisoners.row(3).name.should('contain.text', 'Saunders, John')
        page.prisoners.row(3).name.find('a').should('not.exist')
        page.prisoners.row(3).prisonNumber.should('contain.text', 'A3333AA')
        page.prisoners.row(3).dateOfBirth.should('contain.text', '12/10/1990')
        page.prisoners.row(3).location.should('contain.text', 'Outside - released from Moorland (HMP & YOI)')
        page.prisoners.row(3).workingName.should('contain.text', 'Saunders, John')
        page.prisoners.row(3).licences.should('be.empty')
      })

      it('Should not show restricted information for high-profile prisoners in prison but outside caseloads', () => {
        cy.task('stubCheckHighProfilePrisoners', {
          highProfilePrisoners: prisoners.map(prisoner => prisoner.prisonerNumber),
          prisonerNumbersToCheck: prisoners.map(prisoner => prisoner.prisonerNumber),
        })
        cy.signIn({ redirectPath: '/global-search/results?searchText=SAUNDERS' })

        const page = Page.verifyOnPage(GlobalSearchResults)
        page.prisoners.rows.should('have.length', 4)

        page.prisoners.row(0).location.should('contain.text', 'Moorland (HMP & YOI)')
        page.prisoners.row(1).location.should('contain.text', 'Restricted')
        page.prisoners.row(2).location.should('contain.text', 'Transfer')
        page.prisoners.row(3).location.should('contain.text', 'Outside - released from Moorland (HMP & YOI)')
      })
    })

    context('With the licences roles', () => {
      beforeEach(() => {
        cy.setupUserAuth({
          roles: [
            'ROLE_PRISON',
            `ROLE_${Role.GlobalSearch}`,
            `ROLE_${Role.LicencesReadOnly}`,
            `ROLE_${Role.LicencesVary}`,
          ],
        })
        cy.signIn({ redirectPath: '/global-search/results?searchText=SAUNDERS' })
      })

      it('Should load the page and display the licences link', () => {
        const page = Page.verifyOnPage(GlobalSearchResults)
        page.prisoners.row(0).licences.should('contain.text', 'Update')
      })
    })
  })
})
