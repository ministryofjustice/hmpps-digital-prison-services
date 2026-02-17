import { SortableTable } from '@ministryofjustice/frontend'

document.querySelector<HTMLAnchorElement>('.js-prisoner-search-clear-alerts')?.addEventListener('click', e => {
  e.preventDefault()
  document.querySelectorAll<HTMLInputElement>('.js-prisoner-search-alerts input[type=checkbox]').forEach(item => {
    item.checked = false
  })
})

document.querySelectorAll<HTMLTableElement>('.prisoner-search__results-list table').forEach(table => {
  new SortableTable(table)
})
