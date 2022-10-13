import BaseInput from './baseInput.js'

export default class TextInput extends BaseInput {
  message = ''
  abrvs = []

  createMessage (game, p, newText = null) {
    let plays = ''
    this.message = (newText || game.players[p].team.name + ' pick a play from the following:') + '\n'

    for (let i = 0; i < this.legalChoices.length; i++) {
      this.abrvs[i] = this.legalChoices[i].abrv
      if (i !== 0) {
        plays += ', '
      }
      plays += this.legalChoices[i].abrv
    }

    this.message += '[ ' + plays + ' ]:\n'
  }
}
