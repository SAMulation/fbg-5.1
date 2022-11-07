const hideField = () => {
  document.querySelector('.clock').addEventListener('click', event => {
    if (document.querySelector('.field-container').classList.contains('slide-away')) {
      document.querySelector('.field-container').classList.remove('slide-away')
    //   document.querySelector('.field-container').style.display = 'block'
    } else {
      document.querySelector('.field-container').classList.add('slide-away')
    //   document.querySelector('.field-container').style.display = 'none'
    }
  })
}

const moveCard = () => {
  const cards = document.querySelectorAll('.cards-container button.card')
  cards.forEach(card => {
    card.addEventListener('click', event => {
      const val = event.target.innerText
      event.target.style.display = 'none'
      document.querySelector('.pl-card1').innerText = val
      document.querySelector('.pl-card1').classList.add('picked')
    })
  })
}

hideField()
moveCard()
