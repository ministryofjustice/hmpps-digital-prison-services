import * as mojFrontend from '@ministryofjustice/frontend'

document.querySelector('.js-prisoner-search-clear-alerts').addEventListener('click', function (e) {
  e.preventDefault()
  document.querySelectorAll('.js-prisoner-search-alerts input[type=checkbox]').forEach(item => {
    item.checked = false
  })
})

document.querySelectorAll('.prisoner-search__results-list table').forEach(table => {
  new mojFrontend.SortableTable(table)
})
