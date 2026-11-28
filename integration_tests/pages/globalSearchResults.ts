import Page from './page'

export default class GlobalSearchResults extends Page {
  constructor() {
    super('Global search results')
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
          get dateOfBirth() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(4)')
          },
          get location() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(5)')
          },
          get workingName() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(6)')
          },
          get licences() {
            return rows().eq(i).find<HTMLTableCellElement>('td:nth-child(7)')
          },
        }
      },
    }
  }
}
