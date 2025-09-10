import * as govukFrontend from 'govuk-frontend'
import * as mojFrontend from '@ministryofjustice/frontend'

import { printPage } from './printPage'
import { sortSelector } from './sortSelector'

document.addEventListener('DOMContentLoaded', function () {
  printPage()
  sortSelector()
})

govukFrontend.initAll()
mojFrontend.initAll()
