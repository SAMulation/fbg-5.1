import TextInput from './textInput.js'
import { EXIT } from './defaults.js'

export default class PromptInput extends TextInput {
  async getInput (game, p, type, newText = null) {
    // Get legal choices
    this.makeChoices(game, type, p)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let selection = ''

        // Get message ready
        this.createMessage(game, p, newText)

        while (selection === '') {
          selection = prompt(this.message)
          if (!selection) {
            game.status = EXIT
            selection = 'EXIT'
          } else {
            selection = this.abrvs.includes(selection.toUpperCase()) ? selection.toUpperCase() : ''
          }
        }

        resolve(selection)
      }, 1)
    })
  }
}
