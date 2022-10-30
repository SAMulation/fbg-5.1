import BaseInput from './baseInput.js'
import { animationWaitForCompletion } from './graphics.js'

export default class ButtonInput extends BaseInput {
  async getInput (game, p, type) {
    // Get legal choices
    this.makeChoices(game, type, p)

    this.getButtonInput(game, p)
    return new Promise(resolve => {
      this.bindButtons(game, document.querySelectorAll('button.card'), document.querySelector('.to-butt'), resolve, p)
    })
  }

  getButtonInput (game, p) {
    // Cache the DOM element that will store play and timeout buttons
    // const buttonArea = document.querySelector('.selection.pl' + p)
    const buttonArea = document.querySelector('.cards-container .cards')
    const timeout = document.querySelector('.to-butt')

    // Clear buttonArea and timeout
    buttonArea.innerText = ''
    timeout.innerText = ''

    // Loop through legalChoices and add buttons
    for (let i = 0; i < this.legalChoices.length; i++) {
      if (this.legalChoices[i].abrv !== 'TO') {
        const btn = document.createElement('button')
        const t = document.createTextNode(this.legalChoices[i].name) // Formerly .abrv
        btn.appendChild(t)
        btn.classList.add('card')
        btn.setAttribute('data-playType', this.legalChoices[i].abrv)
        buttonArea.appendChild(btn)
      } else {
        timeout.innerText = 'Timeouts (' + game.players[p].timeouts + ')'
      }
    }
  }

  bindButtons (game, buttons, timeout, resolve, p) {
    // const toggleCardsContainer = async () => {
    //   await animationWaitForCompletion(game.run.cardsContainer, 'slide-down', !game.run.cardsContainer.classList.contains('slide-down'))
    // }

    // game.run.alertMessage.addEventListener('click', toggleCardsContainer)
    timeout.timeouts = game.players[p].timeouts
    game.run.alertMessage.disabled = false
    if (timeout.innerText && timeout.timeouts && game.changeTime === 0) {
      timeout.disabled = false
      timeout.changeTime = 0
    }

    buttons.forEach(button => {
      button.addEventListener('click', event => {
        // Return play type
        resolve(event.target.getAttribute('data-playType'))
        if (event.target.getAttribute('data-playType') !== 'TO') {
          game.run.alertMessage.disabled = true
          event.target.parentElement.innerHTML = ''
        }
        timeout.disabled = true
      })
    })
  }
}
