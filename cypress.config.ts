import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import prison from './integration_tests/mockApis/prison'
import contentful from './integration_tests/mockApis/contentful'
import dps from './integration_tests/mockApis/dps'
import prisonerSearch from './integration_tests/mockApis/prisonerSearch'
import feComponents from './integration_tests/mockApis/feComponents'
import locations from './integration_tests/mockApis/locations'
import healthAndMedication from './integration_tests/mockApis/healthAndMedication'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,
        ...prison,
        ...locations,
        ...contentful,
        ...dps,
        ...prisonerSearch,
        ...feComponents,
        ...healthAndMedication,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
