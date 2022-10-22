import BaseInput from './baseInput.js'

export default class ButtonInput extends BaseInput {
  async getInput (game, p, type) {
    // Get legal choices
    this.makeChoices(game, type, p)

    this.getButtonInput(game, p)
    // .reg left aligns buttons and allows scrolling, without center
    // if (type === 'reg') {
    //   document.querySelector('.selection.pl' + p).classList.add('reg')
    // } else {
    //   document.querySelector('.selection.pl' + p).classList.remove('reg')
    // }
    if (type === 'reg') {
      document.querySelector('.cards-container').classList.add('reg')
    } else {
      document.querySelector('.cards-container').classList.remove('reg')
    }
    return new Promise((resolve, reject) => {
      this.bindButtons(document.querySelectorAll('button.card'), resolve, p)
    })
  }

  getButtonInput (game, p) {
    // Cache the DOM element that will store play and timeout buttons
    // const buttonArea = document.querySelector('.selection.pl' + p)
    const buttonArea = document.querySelector('.cards-container .cards')
    const timeout = document.querySelector('.to-butt' + p)

    // Clear buttonArea and timeout
    buttonArea.innerText = ''
    timeout.innerText = ''

    // Loop through legalChoices and add buttons
    for (let i = 0; i < this.legalChoices.length; i++) {
      const btn = document.createElement('button')
      const t = document.createTextNode(this.legalChoices[i].abrv) // Formerly .name
      btn.appendChild(t)
      // btn.classList.add('play')
      btn.classList.add('card')
      // Set data-playType to play abrv, used throughout
      btn.setAttribute('data-playType', this.legalChoices[i].abrv)

      // Append child to container div
      if (this.legalChoices[i].abrv === 'TO') {
        // Disable Timeout button if out of timeouts
        if (game.players[p].timeouts === 0 || game.time_change) {
          btn.setAttribute('disabled', '')
        }
        timeout.appendChild(btn)
      } else {
        buttonArea.appendChild(btn)
      }
    }
  }

  bindButtons (buttons, resolve, p) {
    buttons.forEach(button => {
      button.addEventListener('click', event => {
        resolve(event.target.getAttribute('data-playType'))
        const val = event.target.innerText
        // event.target.style.display = 'none'
        document.querySelector('.pl-card' + p).innerText = val
        document.querySelector('.pl-card' + p).classList.add('picked')
        event.target.parentElement.innerHTML = ''
        if (document.querySelector('.field-container').classList.contains('slide-away')) {
          document.querySelector('.field-container').classList.remove('slide-away')
        //   document.querySelector('.field-container').style.display = 'block'
        } else {
          document.querySelector('.field-container').classList.add('slide-away')
        //   document.querySelector('.field-container').style.display = 'none'
        }
      })
    })
  }
}
