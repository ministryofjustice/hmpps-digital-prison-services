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

  whatsNew = () => {
    const whatsNewSection = (): PageElement => cy.get('[data-qa=homepage-whats-new-section]')

    return {
      heading: () => whatsNewSection().find('h2'),
      whatsNewPost: () => whatsNewSection().find('.whats-new-post'),
    }
  }

  help = () => {
    const helpSection = (): PageElement => cy.get('[data-qa=homepage-help-section]')

    return {
      heading: () => helpSection().find('h2'),
      subHeading1: () => helpSection().find('h3:nth-of-type(1)'),
      subHeading2: () => helpSection().find('h3:nth-of-type(2)'),
      subHeading3: () => helpSection().find('h3:nth-of-type(3)'),
    }
  }
}
