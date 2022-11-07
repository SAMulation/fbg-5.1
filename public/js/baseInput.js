import { BUTTONS } from './buttons.js'

export default class BaseInput {
  makeChoices (game, type, p) {
    // Return appropriate set of buttons
    const buttons = BUTTONS[type]

    this.legalChoices = []

    // Loop through DEF_PLAYS and add to storage array if legal
    for (const key in buttons) {
      if (game.run.playLegal(p, type, key, type)) {
        this.legalChoices.push({ name: buttons[key].name, abrv: key })
      }
    }

    // Add timeout for reg, kick, ret
    if (type === 'reg' || type === 'kick' || type === 'ret') {
      this.legalChoices.push({ name: 'Timeout', abrv: 'TO' })
    }
  }
}
