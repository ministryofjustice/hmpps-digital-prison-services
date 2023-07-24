import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Welcome to Digital Prison Services')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  hero = () => {
    const dpsHeader = (): PageElement => cy.get('.dps-header')

    return {
      h1: () => dpsHeader().find('h1'),
      strapLine: () => dpsHeader().find('p'),
      link: () => dpsHeader().find('a'),
    }
  }

  search = () => {
    const searchSection = (): PageElement => cy.get('[data-qa=homepage-search-section]')

    return {
      heading: () => searchSection().find('h2'),
      localGlobalRadios: () => searchSection().find('[data-qa=local-global-radios]'),
      nameField: () => searchSection().find('[name=name]'),
      locationField: () => searchSection().find('[name=location]'),
      viewAllLink: () => searchSection().find('[data-qa=search-view-all-link]'),
    }
  }

  today = () => {
    const todaySection = (): PageElement => cy.get('[data-qa=homepage-today-section]')

    return {
      heading: () => todaySection().find('h2'),
      lastUpdated: () => todaySection().find('.today-last-updated'),
      unlockRollCard: () => todaySection().find('[data-qa=today-unlock-roll-card]'),
      populationCard: () => todaySection().find('[data-qa=today-current-population-card]'),
      inTodayCard: () => todaySection().find('[data-qa=today-in-card]'),
      outTodayCard: () => todaySection().find('[data-qa=today-out-card]'),
    }
  }
}
