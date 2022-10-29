import BaseInput from './baseInput.js'

export default class ButtonInput extends BaseInput {
  async getInput (game, p, type) {
    // Get legal choices
    this.makeChoices(game, type, p)

    this.getButtonInput(game, p)
    return new Promise(resolve => {
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
      const t = document.createTextNode(this.legalChoices[i].name) // Formerly .abrv
      btn.appendChild(t)
      // btn.classList.add('play')
      btn.classList.add('card')
      // Set data-playType to play abrv, used throughout
      btn.setAttribute('data-playType', this.legalChoices[i].abrv)

      // Append child to container div
      if (this.legalChoices[i].abrv === 'TO') {
        // Disable Timeout button if out of timeouts
        if (game.players[p].timeouts === 0 || game.changeTime) {
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
        // Return play type
        resolve(event.target.getAttribute('data-playType'))
        event.target.parentElement.innerHTML = ''
      })
    })
  }
}
