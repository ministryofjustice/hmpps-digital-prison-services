const reportFrame = document.querySelector<HTMLIFrameElement>('#diet-report-frame')

if (reportFrame) {
  reportFrame.addEventListener('load', evt => {
    evt.preventDefault()
    window.frames[0]?.print()
  })
}
