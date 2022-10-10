import TextInput from './textInput.js'

export default class PromptInput extends TextInput {
  async getInput (game, p, type) {
    // Get legal choices
    this.makeChoices(game, type, p)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let selection = ''

        // Get message ready
        this.createMessage(game, p)

        while (selection === '') {
          selection = prompt(this.message)
          if (!selection) {
            game.status = 999
            selection = 'EXIT'
          } else {
            selection = this.abrvs.includes(selection.toUpperCase()) ? selection.toUpperCase() : ''
          }
        }

        this.abrvs = []
        this.legalChoices = []
        this.message = ''
        resolve(selection)
      }, 1)
    })
  }
}
