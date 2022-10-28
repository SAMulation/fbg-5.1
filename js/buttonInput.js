import BaseInput from './baseInput.js'
import { EXIT } from './defaults.js'

export default class ButtonInput extends BaseInput {
  // gameSetup = document.querySelector('.game-setup-container')
  // scoreboardContainer = document.querySelector('.scoreboard-container')
  // scoreboardContainerTopLeft = document.querySelector('.scoreboard-container .away-msg.top-msg')
  // scoreboardContainerTopRight = document.querySelector('.scoreboard-container .home-msg.top-msg')
  // scoreboardContainerBotLeft = document.querySelector('.scoreboard-container .away-msg.bot-msg')
  // scoreboardContainerBotRight = document.querySelector('.scoreboard-container .home-msg.bot-msg')
  // fieldContainer = document.querySelector('.field-container')
  // boardContainer = document.querySelector('.board-container')
  // plCard1 = document.querySelector('.board-container .pl-card1')
  // plCard2 = document.querySelector('.board-container .pl-card2')
  // multCard = document.querySelector('.board-container .mult-card')
  // yardCard = document.querySelector('.board-container .yard-card')
  // qualityContainer = document.querySelector('.board-container .quality-container')
  // timesContainer = document.querySelector('.board-container .times-container')
  // cardsContainer = document.querySelector('.cards-container')
  // actualCards = this.cardsContainer.querySelector('.cards')

  // animationSimple (el, cls, off = false) {
  //   if ((!off && !el.classList.contains(cls)) || (off && el.classList.contains(cls))) {
  //     el.classList.toggle(cls)
  //   }
  // }

  // async animationWaitForCompletion (el, cls, off = false) {
  //   return new Promise(resolve => {
  //     el.addEventListener('transitionend', () => {
  //       resolve()
  //     }, { once: true })
  //     animationSimple(el, cls, off)
  //   })
  // }

  // async animationPrePick (game, p) {
  //   if (game.isReal(p)) {
  //     await animationWaitForCompletion(this.cardsContainer, 'slide-down', 'off')
  //   }
  //   animationSimple(this.scoreboardContainerTopLeft, 'collapsed', 'off')
  //   animationSimple(this.scoreboardContainerTopRight, 'collapsed', 'off')
  // }

  // async animationPostPick (event, game, p) {
  //   const val = event.target.innerText
  //   animationSimple(this.scoreboardContainerTopLeft, 'collapsed')
  //   animationSimple(this.scoreboardContainerTopRight, 'collapsed')

  //   if (game.isReal(p)) {
  //     await animationWaitForCompletion(this.cardsContainer, 'slide-down')
  //   }

  //   document.querySelector('.pl-card' + p).innerText = val
  //   document.querySelector('.pl-card' + p).classList.add('picked')
  //   event.target.parentElement.innerHTML = ''
  // }

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
    // if (type === 'reg') {
    //   document.querySelector('.cards-container').classList.add('reg')
    // } else {
    //   document.querySelector('.cards-container').classList.remove('reg')
    // }
    // await animationPrePick(game, p)
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
        resolve(event.target.getAttribute('data-playType'))
        // const val = event.target.innerText
        // event.target.style.display = 'none'
        // document.querySelector('.pl-card' + p).innerText = val
        // document.querySelector('.pl-card' + p).classList.add('picked')
        event.target.parentElement.innerHTML = ''
      })
    })
  }
}
