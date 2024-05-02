const landingRows = document.querySelectorAll('.establishment-roll__table__landing-row')
const spurRows = document.querySelectorAll('.establishment-roll__table__spur-row')
const wingRows = document.querySelectorAll('.establishment-roll__table__wing-row')
const totalsRow = document.querySelector('#roll-table-totals-row')

function init() {
  ;[...landingRows, ...spurRows].forEach(row => {
    row.setAttribute('hidden', 'hidden')
  })

  wingRows.forEach((wingRow, index) => {
    const wingId = wingRow.getAttribute('id')
    const wingNameCell = wingRow.getElementsByTagName('td')[0]
    const wingNameText = wingNameCell.innerText
    const childRows = document.querySelectorAll('[data-wing-id="' + wingId + '"]')
    const childrenIds = [...childRows].map(row => row.getAttribute('id'))

    const wingLink = document.createElement('a')
    wingLink.setAttribute('href', '#')
    wingLink.setAttribute('class', 'govuk-details__summary govuk-link--no-visited-state')
    wingLink.setAttribute('aria-controls', childrenIds.join(' '))
    wingLink.innerHTML = wingNameText

    wingLink.addEventListener('click', function (event) {
      event.preventDefault()
      const nextRow = wingRows[index + 1] ? wingRows[index + 1] : totalsRow

      childRows.forEach(row => {
        const isOpen = !row.getAttribute('hidden')

        if (isOpen) {
          row.setAttribute('hidden', 'hidden')
          wingLink.setAttribute('aria-expanded', 'false')
          wingRow.classList.remove('open')
          nextRow.classList.remove('next-wing-to-open')
        } else {
          row.removeAttribute('hidden')
          wingLink.setAttribute('aria-expanded', 'true')
          wingRow.classList.add('open')
          nextRow.classList.add('next-wing-to-open')
        }
      })
    })

    wingNameCell.replaceChildren(wingLink)
  })
}

init()
