import {BUTTONS} from './buttons.js'

export default class ButtonInput {
    constructor(type = 'button') {
        this.type = type;  // 'text' for text input, 'button' for default, 'mock' for testing
    }

    async getText (game, p, msg, type) {
        let textSelection;
        let promised;
        let storage = [];

        // Make the buttons
        storage = this.makeChoices(game, type, p, textSelection);
        
        if (this.type === 'button') {
            this.getButtonInput(game, storage, p);
            // .reg left aligns buttons and allows scrolling, without center
            if (type === 'reg') {
                document.querySelector('.selection.pl' + p).classList.add('reg');
            } else {
                document.querySelector('.selection.pl' + p).classList.remove('reg');
            }
            promised = new Promise((resolve, reject) => {
                this.bindButtons(document.querySelectorAll('button.play'), resolve, p);
            });
        } else if (this.type === 'text') {
            // promised = this.setupTextInput(game, storage, p);
            const abrvs = this.setupTextInput(game, storage, p)
            promised = new Promise((resolve, reject) => {
                this.bindSubmitButton(document.getElementById('pl' + p + 'submit'), resolve, abrvs);
            });
        } else if (this.type === 'prompt') {
            promised = new Promise((resolve, reject) => {
                setTimeout(() => {
                    const {msg, abrvs} = this.setupPromptInput(game, storage, p)
                    let selection = ''
        
                    while (selection === '') {
                        selection = prompt(msg)
                        if (!selection) {
                            game.status = 999
                            selection = 'EXIT'
                        } else {
                            selection = abrvs.includes(selection.toUpperCase()) ? selection.toUpperCase() : ''
                        }
                    }
        
                    resolve(selection)
                }, 1)
            })
        }

        // Return play abbreviation when clicked
        // return new Promise((resolve, reject) => {
        //     this.bindButtons(document.querySelectorAll('button.play'), resolve, p);
        // });
        return promised;
    }

    bindButtons (buttons, resolve, p) {
        buttons.forEach(button => {
            button.addEventListener('click', event => {
                resolve(event.target.getAttribute("data-playType"));
                event.target.parentElement.innerHTML = '';
            });
        })
    }

    bindSubmitButton (button, resolve, abrvs) {
        button.addEventListener('submit', event => {
            event.preventDefault()
            if (abrvs.includes(event.target.input.value.toUpperCase())) {
                resolve(event.target.value)
                event.target.parentElement.innerHTML = ''
            } else {
                event.target.input.value = ''
            }
        })
    }

    makeChoices(game, type, p, textSelection = null) {
        let storage = []  // Temporary storage

        // Return appropriate set of buttons
        const buttons = BUTTONS[type]

        // Loop through DEF_PLAYS and add to storage array if legal
        for (let key in buttons) {
            if (game.run.playLegal(p, type, key, type)) {
                storage.push({ 'name': buttons[key]['name'], 'abrv': key })
            }
        }

        // Add timeout for reg, kick, ret
        if (type === 'reg' || type === 'kick' || type === 'ret') {
            storage.push({ 'name': 'Timeout', 'abrv': 'TO' })
        }

        // console.log(storage)  // What's the storage array look like?
        return storage
    }

    setupPromptInput(game, storage, p) {
        let msg = game.players[p].team.name + ' pick a play from the following:\n';
        let plays = '';
        // let selection = '';
        let abrvs = [];

        for (let i = 0; i < storage.length; i++) {
            abrvs[i] = storage[i]['abrv'];
            if (i !== 0) {
                plays += ', ';
            }
            plays += storage[i]['abrv'];
        }

        msg += '[ ' + plays + ' ]:\n';
        return {msg, abrvs};
    }

    setupTextInput(game, storage, p) {
        // Output possible choices using storage
        // text input that can reference storage for validity
        const formArea = document.querySelector('.selection.pl' + p)
        const formEl = document.createElement('form')
        const labelEl = document.createElement('label')
        const textEl = document.createElement('input')
        textEl.setAttribute('type', 'text')
        textEl.id = 'pl' + p
        const submitEl = document.createElement('input')
        submitEl.setAttribute('type', 'submit')
        submitEl.id = 'pl' + p + 'submit'
        let msg = game.players[p].team.name + ' pick a play from the following:\n';
        let plays = '';
        // let selection = '';
        let abrvs = [];

        for (let i = 0; i < storage.length; i++) {
            abrvs[i] = storage[i]['abrv'];
            if (i !== 0) {
                plays += ', ';
            }
            plays += storage[i]['abrv'];
        }

        msg += '[ ' + plays + ' ]:\n';
        labelEl.innerText = msg

        formEl.appendChild(labelEl)
        formEl.appendChild(textEl)
        formEl.appendChild(submitEl)

        formArea.appendChild(formEl)

        // while (selection === '') {
        //     selection = prompt(msg);
        //     console.log(abrvs.includes(selection));
        //     if (!selection) {
        //         game.status = 999;
        //         selection = 'EXIT';
        //     } else {
        //         selection = abrvs.includes(selection.toUpperCase()) ? selection.toUpperCase() : '';
        //     }
        // }

        return abrvs;
    }

    getConsoleInput(game, storage, p) {
        // Output possible choices using storage
        // text input that can reference storage for validity
        let msg = game.players[p].team.name + ' pick a play from the following:\n';
        let plays = '';
        let selection = '';
        let abrvs = [];

        for (let i = 0; i < storage.length; i++) {
            abrvs[i] = storage[i]['abrv'];
            if (i !== 0) {
                plays += ', ';
            }
            plays += storage[i]['abrv'];
        }

        msg += '[ ' + plays + ' ]\n';
        msg += 'Enter: "selection = XX" where XX is play abrv\n';
        while (selection === '') {
            console.log(msg);
            if (!selection) {
                game.status = 999;
                selection = 'EXIT';
            } else {
                selection = abrvs.includes(selection.toUpperCase()) ? selection.toUpperCase() : '';
            }
        }

        return selection;
    }

    getButtonInput(game, storage, p) {
        // Cache the DOM element that will store play and timeout buttons
        const buttonArea = document.querySelector('.selection.pl' + p)
        const timeout = document.querySelector('.to' + p)
        
        // Clear buttonArea and timeout
        buttonArea.innerText = ''
        timeout.innerText = ''

        // Loop through storage and add buttons
        for (let i = 0; i < storage.length; i++) {
            const btn = document.createElement("button")
            const t = document.createTextNode(storage[i]['name'])
            btn.appendChild(t)
            btn.classList.add('play')
            // Set data-playType to play abrv, used throughout
            btn.setAttribute('data-playType', storage[i]['abrv'])

            // Append child to container div
            if (storage[i]['abrv'] === 'TO') {
                // Disable Timeout button if out of timeouts
                if (game.players[p].timeouts === 0 || game.time_change) {
                    btn.setAttribute('disabled', '')
                }
                timeout.appendChild(btn)
            } else {
                buttonArea.appendChild(btn)
            }
        }
    }
}