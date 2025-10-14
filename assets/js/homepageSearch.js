const searchType = document.querySelectorAll('[name=searchType]')
const locationDropdown = document.getElementById('location')
const globalNameHintText = document.getElementById('name-hint')

searchType.forEach(el => {
  if (el.checked && el.value === 'global') {
    locationDropdown.disabled = true
    locationDropdown.selectedIndex = 0
    globalNameHintText.hidden = false
  }
  el.addEventListener('change', src => {
    const searchType = src.target.value
    if (searchType === 'global') {
      locationDropdown.disabled = true
      locationDropdown.selectedIndex = 0
      globalNameHintText.hidden = false
    } else {
      locationDropdown.disabled = false
      globalNameHintText.hidden = true
    }
  })
})
