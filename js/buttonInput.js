import BaseInput from './baseInput.js'
import { alertBox, animationSimple, animationWaitForCompletion } from './graphics.js'

export default class ButtonInput extends BaseInput {
  // Old version
  // async getInput (game, p, type, msg = null) {
  //   // Get legal choices
  //   this.makeChoices(game, type, p)

  //   this.getButtonInput(game, p)
  //   return new Promise(resolve => {
  //     this.bindButtons(game, document.querySelectorAll('button.card'), document.querySelector('.to-butt'), resolve, p, msg)
  //   })
  // }

  async getInput (game, p, type, msg = null) {
    let selection = null

    if (game.me === p) {
      selection = await this.prepareAndGetUserInput(game, p, type, msg)
    } else {
      await alertBox(game.run, game.players[p].team.name + ' are picking their play...')
      if (game.isMultiplayer()) {
        selection = await game.run.receiveInputFromRemote()
      } else {
        await game.run.cpuPages(game, type)
      }
    }

    return selection
  }

  async prepareAndGetUserInput (game, p, type, msg = null) {
    game.run.scoreboardContainerTopLeft.innerText = (p === game.away ? 'Pick your play' : game.lastPlay)
    game.run.scoreboardContainerTopRight.innerText = (p === game.away ? game.lastPlay : 'Pick your play')
    animationSimple(game.run.scoreboardContainerTopLeft, 'collapsed', false)
    animationSimple(game.run.scoreboardContainerTopRight, 'collapsed', false)
    await animationWaitForCompletion(game.run.cardsContainer, 'slide-down', false)
    const selection = await game.run.input.getUserInput(game, p, type, msg)
    if (game.isMultiplayer()) {
      game.run.sendInputToRemote(selection)
    }
    await animationWaitForCompletion(game.run.cardsContainer, 'slide-down')

    return selection
  }

  async getUserInput (game, p, type, msg = null) {
    // Get legal choices
    this.makeChoices(game, type, p)

    this.getButtonInput(game, p)
    return new Promise(resolve => {
      this.bindButtons(game, document.querySelectorAll('button.card'), document.querySelector('.to-butt'), resolve, p, msg)
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

  bindButtons (game, buttons, timeout, resolve, p, msg) {
    timeout.timeouts = game.players[p].timeouts
    game.run.alertMessage.disabled = false
    if (timeout.innerText && timeout.timeouts && game.changeTime === 0) {
      timeout.disabled = false
      timeout.changeTime = 0
    }

    if (msg) {
      game.run.alertMessage.innerText = msg
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
