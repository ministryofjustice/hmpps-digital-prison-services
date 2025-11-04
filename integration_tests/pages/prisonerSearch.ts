import Page from './page'

export default class PrisonerSearch extends Page {
  constructor() {
    super('Prisoner search results')
  }

  prisoners = () => ({
    rows: () => cy.get('table tbody tr'),
    row: (i: number) => ({
      photo: () => cy.get('table tbody tr').eq(i).find('td').eq(0),
      name: () => cy.get('table tbody tr').eq(i).find('td').eq(1),
      prisonNumber: () => cy.get('table tbody tr').eq(i).find('td').eq(2),
      location: () => cy.get('table tbody tr').eq(i).find('td').eq(3),
      incentiveLevel: () => cy.get('table tbody tr').eq(i).find('td').eq(4),
      age: () => cy.get('table tbody tr').eq(i).find('td').eq(5),
      alerts: () => cy.get('table tbody tr').eq(i).find('td').eq(6),
    }),
    sorting: () => ({
      name: () => cy.get('table thead th').eq(1),
      location: () => cy.get('table thead th').eq(3),
    }),
  })
}
