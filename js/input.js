import {BUTTONS} from './buttons.js'

// const DEF_PLAYS = {
//     'SR': {
//         'name': 'Short Run',
//         'abrv': 'SR',
//         'count': 3,
//         'type': 'reg'
//     },
//     'LR': {
//         'name': 'Long Run',
//         'abrv': 'LR',
//         'count': 3,
//         'type': 'reg'
//     },
//     'SP': {
//         'name': 'Short Pass',
//         'abrv': 'SP',
//         'count': 3,
//         'type': 'reg'
//     },
//     'LP': {
//         'name': 'Long Pass',
//         'abrv': 'LP',
//         'count': 3,
//         'type': 'reg'
//     },
//     'TP': {
//         'name': 'Trick Play',
//         'abrv': 'TP',
//         'count': 1,
//         'type': 'reg'
//     },
//     'HM': {
//         'name': 'Hail Mary',
//         'abrv': 'HM',
//         'count': 3,
//         'type': 'reg'
//     },
//     'FG': {
//         'name': 'Field Goal',
//         'abrv': 'FG',
//         'count': -1,
//         'type': 'reg'
//     },
//     'PT': {
//         'name': 'Punt',
//         'abrv': 'PT',
//         'count': -1,
//         'type': 'reg'
//     },
//     'RK': {
//         'name': 'Regular Kick',
//         'abrv': 'RK',
//         'count': -1,
//         'type': 'kick'
//     },
//     'OK': {
//         'name': 'Onside Kick',
//         'abrv': 'OK',
//         'count': -1,
//         'type': 'kick'
//     },
//     'SK': {
//         'name': 'Squib Kick',
//         'abrv': 'SK',
//         'count': -1,
//         'type': 'kick'
//     },
//     'RR': {
//         'name': 'Regular Return',
//         'abrv': 'RR',
//         'count': -1,
//         'type': 'ret'
//     },
//     'OR': {
//         'name': 'Onside Return',
//         'abrv': 'OR',
//         'count': -1,
//         'type': 'ret'
//     },
//     'TB': {
//         'name': 'Touchback',
//         'abrv': 'TB',
//         'count': -1,
//         'type': 'ret'
//     },
//     'XP': {
//         'name': 'Extra Point',
//         'abrv': 'XP',
//         'count': -1,
//         'type': 'pat'
//     },
//     '2P': {
//         'name': '2-point Conversion',
//         'abrv': '2P',
//         'count': -1,
//         'type': 'pat'
//     },
//     'H': {
//         'name': 'Heads',
//         'abrv': 'H',
//         'count': -1,
//         'type': 'coin'
//     },
//     'T': {
//         'name': 'Tails',
//         'abrv': 'T',
//         'count': -1,
//         'type': 'coin'
//     },
//     'K': {
//         'name': 'Kick',
//         'abrv': 'K',
//         'count': -1,
//         'type': 'kickDecReg'
//     },
//     'R': {
//         'name': 'Receive',
//         'abrv': 'R',
//         'count': -1,
//         'type': 'kickDecReg'
//     },
//     '1': {
//         'name': 'Ball 1st',
//         'abrv': '1',
//         'count': -1,
//         'type': 'kickDecOT'
//     },
//     '2': {
//         'name': 'Ball 2nd',
//         'abrv': '2',
//         'count': -1,
//         'type': 'kickDecOT'
//     },
//     'TO': {
//         'name': 'Timeout',
//         'abrv': 'TO',
//         'count': 3,
//         'type': 'all'
//     },
//     'Y': {
//         'name': 'Yes!!! Call timeout!',
//         'abrv': 'Y',
//         'count': -1,
//         'type': 'last'
//     },
//     'N': {
//         'name': 'Nah... End this!',
//         'abrv': 'N',
//         'count': -1,
//         'type': 'last'
//     }
// }

export default class ButtonInput {
    constructor(type = 'button') {
        this.type = type;  // 'text' for text input, 'button' for default, 'mock' for testing
    }

    async getText (game, p, msg, type) {
        // Make the buttons
        this.makeChoices(game, type, p);
        
        // .reg left aligns buttons and allows scrolling, without center
        if (type === 'reg') {
            document.querySelector('.selection.pl' + p).classList.add('reg');
        } else {
            document.querySelector('.selection.pl' + p).classList.remove('reg');
        }
        
        // Return play abbreviation when clicked
        return new Promise((resolve, reject) => {
            this.bindButtons(document.querySelectorAll('button.play'), resolve, p);
        });
    }

    bindButtons (buttons, resolve, p) {
        buttons.forEach(button => {
            button.addEventListener('click', event => {
                resolve(event.target.getAttribute("data-playType"));
                event.target.parentElement.innerHTML = '';
            });
        })
    }

    makeChoices(game, type, p) {
        let storage = []  // Temporary storage
        let count = 0   // Number of plays stored

        // Return appropriate set of buttons
        const buttons = BUTTONS[type];

        // Loop through DEF_PLAYS and add to storage array if legal
        for (let key in buttons) {
            if (game.run.playLegal(p, type, key, type)) {
                storage[count] = { 'name': buttons[key]['name'], 'abrv': key };
                count++
            }
        }

        // Add timeout for reg, kick, ret
        if (type === 'reg' || type === 'kick' || type === 'ret') {
            storage[count] = { 'name': 'Timeout', 'abrv': 'TO' };
            count++;
        }

        console.log(storage)  // What's the storage array look like?

        if (this.type === 'text') {
            // Output possible choices using storage
            // text input that can reference storage for validity
        } else if (this.type === 'mock') {
            // Coming later
        } else {
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
                // Set the button to disabled if count is zero (prevents negatives)
                // if (game.players[p].plays.hasOwnProperty(storage[i]['abrv']) && game.players[p].plays[storage[i]['abrv']]['count'] === 0 ||
                //     storage[i]['abrv'] === 'HM' && game.players[p].hm) {
                //     btn.setAttribute('disabled', '')
                // }
                if (storage[i]['abrv'] === 'TO') {
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

    // disableTimeout(p) {
    //     if (this.type === 'button') {
    //         const timeoutButton = document.querySelector('.to' + p + ' button.play')
    //         // timeoutButton.setAttribute('disabled', '')
    //     }
    // }
}