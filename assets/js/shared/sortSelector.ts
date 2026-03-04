export function sortSelector() {
  Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach(s => {
    const $select = s as HTMLSelectElement
    $select.addEventListener('change', () => {
      $select.form?.submit()
    })
  })
}
