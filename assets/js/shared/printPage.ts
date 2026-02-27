export function printPage() {
  const printLinks = document.querySelectorAll<HTMLAnchorElement>('.js-print-link')

  if (printLinks?.length) {
    printLinks.forEach(el =>
      el.addEventListener('click', evt => {
        evt.preventDefault()
        window.print()
      }),
    )
  }
}
