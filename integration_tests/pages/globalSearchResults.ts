import Page from './page'

export default class GlobalSearchResults extends Page {
  constructor() {
    super('Global search results')
  }

  prisoners = () => ({
    rows: () => cy.get('table tbody tr'),
    row: (i: number) => ({
      photo: () => cy.get('table tbody tr').eq(i).find('td').eq(0),
      name: () => cy.get('table tbody tr').eq(i).find('td').eq(1),
      prisonNumber: () => cy.get('table tbody tr').eq(i).find('td').eq(2),
      dateOfBirth: () => cy.get('table tbody tr').eq(i).find('td').eq(3),
      location: () => cy.get('table tbody tr').eq(i).find('td').eq(4),
      workingName: () => cy.get('table tbody tr').eq(i).find('td').eq(5),
      licences: () => cy.get('table tbody tr').eq(i).find('td').eq(6),
    }),
  })
}
