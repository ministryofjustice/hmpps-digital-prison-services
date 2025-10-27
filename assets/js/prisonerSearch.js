document.querySelector('.js-prisoner-search-clear-alerts').addEventListener('click', function (e) {
  e.preventDefault()
  document.querySelectorAll('.js-prisoner-search-alerts input[type=checkbox]').forEach(item => {
    item.checked = false
  })
})
