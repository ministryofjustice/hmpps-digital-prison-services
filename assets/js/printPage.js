const printLinks = document.querySelectorAll('.print-link')

if (printLinks?.length) {
  printLinks.forEach(el =>
    el.addEventListener('click', evt => {
      evt.preventDefault()
      window.print()
    }),
  )
}
