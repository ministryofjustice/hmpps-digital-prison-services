const searchType = document.querySelectorAll('[name=searchType]')
const locationDropdown = document.getElementById('location')
searchType.forEach(el => {
  if (el.checked && el.value === 'global') {
    locationDropdown.disabled = true
    locationDropdown.selectedIndex = 0
  }
  el.addEventListener('change', src => {
    const searchType = src.target.value
    if (searchType === 'global') {
      locationDropdown.disabled = true
      locationDropdown.selectedIndex = 0
    } else {
      locationDropdown.disabled = false
    }
  })
})
