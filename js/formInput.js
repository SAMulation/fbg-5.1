import TextInput from './textInput.js'

export default class FormInput extends TextInput {
  form = ''

  async getInput (game, p, type, newText = null) {
    // Get legal choices
    this.makeChoices(game, type, p)

    // Get message ready
    this.createMessage(game, p, newText)
    this.setupTextInput(p)

    return new Promise((resolve, reject) => {
      this.bindSubmitButton(resolve)
    })
  }

  setupTextInput (p, newText = null) {
    // Create HTML elements
    const formArea = document.querySelector('.selection.pl' + p)
    const formEl = document.createElement('form')
    const labelEl = document.createElement('label')
    const textEl = document.createElement('input')
    const submitEl = document.createElement('input')
    textEl.type = 'text'
    textEl.name = 'formInput'
    submitEl.type = 'submit'
    labelEl.innerText = this.message
    formEl.appendChild(labelEl)
    formEl.appendChild(textEl)
    formEl.appendChild(submitEl)
    formArea.appendChild(formEl)
    textEl.focus()

    // Cache form element
    this.form = formEl
  }

  bindSubmitButton (resolve) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()
      const selection = this.form.elements.formInput.value.toUpperCase()
      if (this.abrvs.includes(selection)) {
        resolve(selection)
        this.form.parentNode.removeChild(this.form)
        this.form = ''
        this.abrvs = []
        this.legalChoices = []
        this.message = ''
      }
    })
  }
}
