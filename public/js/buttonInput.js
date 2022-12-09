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
    this.type = 'button'

    if (game.isReal(p)) { // game.me === p
      selection = await this.prepareAndGetUserInput(game, p, type, msg)
    } else {
      await alertBox(game.run, msg || game.players[p].team.name + ' are picking their play...')
      if (game.isMultiplayer() && game.me) { // && game.me
        selection = await game.run.receiveInputFromRemote()
      } else {
        selection = await game.run.cpuPages(game, p, type)

        if (game.connection.type === 'computer-host') {
          game.run.sendInputToRemote(selection)
        } else if (game.connection.type === 'computer-remote') {
          selection = await game.run.receiveInputFromRemote()
        }
      }
    }

    return selection
  }

  switchCardsContainerColor (game, p) {
    animationSimple(game.run.cardsContainer, (game.away === p ? 'home' : 'away') + '-card-cont', false)
    animationWaitForCompletion(game.run.cardsContainer, (game.away === p ? 'away' : 'home') + '-card-cont')
  }

  async prepareAndGetUserInput (game, p, type, msg = null) {
    if (type === 'kick') {
      let downEl = null

      if (game.offNum === game.away) {
        downEl = game.run.scoreboardContainerBotLeft
      } else {
        downEl = game.run.scoreboardContainerBotRight
      }
      downEl.innerText = 'Kickoff'
      animationSimple(game.run.scoreboardContainerBotLeft, 'collapsed', false)
      animationSimple(game.run.scoreboardContainerBotRight, 'collapsed', false)
    }

    game.run.scoreboardContainerTopLeft.innerText = (p === game.away ? msg : game.lastPlay) // 'Pick your play'
    game.run.scoreboardContainerTopRight.innerText = (p === game.away ? game.lastPlay : msg)
    animationSimple(game.run.scoreboardContainerTopLeft, 'collapsed', false)
    animationSimple(game.run.scoreboardContainerTopRight, 'collapsed', false)
    this.switchCardsContainerColor(game, p)
    await animationWaitForCompletion(game.run.cardsContainer, 'slide-down', false)
    const selection = await this.getUserInput(game, p, type, msg)
    if (game.isMultiplayer()) {
      await game.run.sendInputToRemote(selection)
      // await sleep(1)
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
      let temp = ''
      if (this.legalChoices[i].abrv !== 'TO') {
        const btn = document.createElement('button')
        btn.classList.add('card')
        btn.classList.add((game.away === p ? 'away' : 'home') + '-card')
        btn.setAttribute('data-playType', this.legalChoices[i].abrv)

        // If the choice has a count, it has a base
        if (this.legalChoices[i].base) {
          if (this.legalChoices[i].count) {
            let count
            if (this.legalChoices[i].abrv === 'HM') {
              count = game.players[p].hm
            } else {
              count = game.players[p].plays[this.legalChoices[i].abrv].count
            }
            btn.classList.add('count') // 3 rows, space for count
            temp = `<div class="top-card-container">
              <p class="play-abrv">${this.legalChoices[i].abrv}</p>
              <p class="plays-left">${count}</p>
            </div>`
          } else { // base, but no count
            btn.classList.add('base') // 2 rows, mostly kicks, coins
          }
          const svgClass = game.away === p ? 'away' : 'home'
          temp += `<div class="card-middle">
            <img class="play-overlay" src="./img/${this.legalChoices[i].abrv}.png" alt="🏈">
            <svg class="helmet-card-${svgClass}" height="100%" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 551.574 621.056" width="100%" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:vectornator="http://vectornator.io" xmlns:xlink="http://www.w3.org/1999/xlink">
              <use xlink:href="#card-helmet"/>
            </svg>
          </div>
          <div class="bot-card-container">
            <p class="play-name">${this.legalChoices[i].name}</p>
          </div>`

          console.log(temp)
          btn.innerHTML = temp
        } else {
        // This is the old styling style, works for yeses and noes
          const t = document.createTextNode(this.legalChoices[i].name) // Formerly .abrv
          btn.appendChild(t)
        }
        buttonArea.appendChild(btn)
      } else { // If a timeout is legal, enable button
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
