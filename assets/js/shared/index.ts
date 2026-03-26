import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import { printPage } from './printPage'

govukFrontend.initAll()
mojFrontend.initAll()

document.addEventListener('DOMContentLoaded', () => {
  printPage()
})
