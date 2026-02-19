const searchType = document.querySelectorAll<HTMLInputElement>('[name=searchType]')
const locationDropdown = document.getElementById('location') as HTMLSelectElement
const globalNameHintText = document.getElementById('name-hint') as HTMLDivElement

searchType.forEach(el => {
  if (el.checked && el.value === 'global') {
    locationDropdown.disabled = true
    locationDropdown.selectedIndex = 0
    globalNameHintText.hidden = false
  }
  el.addEventListener('change', src => {
    const searchType = (src.target as HTMLInputElement).value
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
