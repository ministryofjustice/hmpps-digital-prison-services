const reportFrame = document.querySelector('#diet-report-frame')

if (reportFrame) {
  reportFrame.addEventListener('load', evt => {
    evt.preventDefault()
    window.frames['diet-report-frame'].print()
  })
}
