export function sortSelector() {
  Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach((s: HTMLSelectElement) => {
    s.addEventListener('change', () => {
      s.form.submit()
    })
  })
}
