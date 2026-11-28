import Page from './page'

export default class PrisonerSearch extends Page {
  constructor() {
    super('Prisoner search results')
  }

  get prisoners() {
    const rows = () => cy.get<HTMLTableCellElement>('table tbody tr')

    return {
      get rows() {
        return rows()
      },

      row(i: number) {
        return {
          get photo() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(1)')
          },
          get name() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(2)')
          },
          get prisonNumber() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(3)')
          },
          get location() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(4)')
          },
          get incentiveLevel() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(5)')
          },
          get age() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(6)')
          },
          get alerts() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(7)')
          },
        }
      },
    }
  }
}
