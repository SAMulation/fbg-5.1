const hideField = () => {
  document.querySelector('.clock').addEventListener('click', event => {
    if (document.querySelector('.field-container').classList.contains('slide-away')) {
      document.querySelector('.field-container').classList.remove('slide-away')
      document.querySelector('.field-container').style.display = 'block'
    } else {
      document.querySelector('.field-container').classList.add('slide-away')
      document.querySelector('.field-container').style.display = 'none'
    }
  })
}

hideField()
