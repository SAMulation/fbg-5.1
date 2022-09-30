const DEF_PLAYS = {
    'SR': {
        'name': 'Short Run',
        'abrv': 'SR',
        'count': 3,
        'type': 'reg'
    },
    'LR': {
        'name': 'Long Run',
        'abrv': 'LR',
        'count': 3,
        'type': 'reg'
    },
    'SP': {
        'name': 'Short Pass',
        'abrv': 'SP',
        'count': 3,
        'type': 'reg'
    },
    'LP': {
        'name': 'Long Pass',
        'abrv': 'LP',
        'count': 3,
        'type': 'reg'
    },
    'TP': {
        'name': 'Trick Play',
        'abrv': 'TP',
        'count': 1,
        'type': 'reg'
    },
    'HM': {
        'name': 'Hail Mary',
        'abrv': 'HM',
        'count': 3,
        'type': 'reg'
    },
    'FG': {
        'name': 'Field Goal',
        'abrv': 'FG',
        'count': -1,
        'type': 'reg'
    },
    'PT': {
        'name': 'Punt',
        'abrv': 'PT',
        'count': -1,
        'type': 'reg'
    },
    'RK': {
        'name': 'Regular Kick',
        'abrv': 'RK',
        'count': -1,
        'type': 'kick'
    },
    'OK': {
        'name': 'Onside Kick',
        'abrv': 'OK',
        'count': -1,
        'type': 'kick'
    },
    'SK': {
        'name': 'Squib Kick',
        'abrv': 'SK',
        'count': -1,
        'type': 'kick'
    },
    'RR': {
        'name': 'Regular Return',
        'abrv': 'RR',
        'count': -1,
        'type': 'ret'
    },
    'OR': {
        'name': 'Onside Return',
        'abrv': 'OR',
        'count': -1,
        'type': 'ret'
    },
    'TB': {
        'name': 'Touchback',
        'abrv': 'TB',
        'count': -1,
        'type': 'ret'
    },
    'XP': {
        'name': 'Extra Point',
        'abrv': 'XP',
        'count': -1,
        'type': 'pat'
    },
    '2P': {
        'name': '2-point Conversion',
        'abrv': '2P',
        'count': -1,
        'type': 'pat'
    },
    'H': {
        'name': 'Heads',
        'abrv': 'H',
        'count': -1,
        'type': 'coin'
    },
    'T': {
        'name': 'Tails',
        'abrv': 'T',
        'count': -1,
        'type': 'coin'
    },
    'K': {
        'name': 'Kick',
        'abrv': 'K',
        'count': -1,
        'type': 'kickDecReg'
    },
    'R': {
        'name': 'Receive',
        'abrv': 'R',
        'count': -1,
        'type': 'kickDecReg'
    },
    '1': {
        'name': 'Ball 1st',
        'abrv': '1',
        'count': -1,
        'type': 'kickDecOT'
    },
    '2': {
        'name': 'Ball 2nd',
        'abrv': '2',
        'count': -1,
        'type': 'kickDecOT'
    }
}

export default class ButtonInput {
    async getText (game, p, msg, type) {
        this.makeButtons(game, type, p);
        
        if (type === 'reg') {
            document.querySelector('.selection.pl' + p).classList.add('reg');
        } else {
            document.querySelector('.selection.pl' + p).classList.remove('reg');
        }
        
        // Play abbreviation
        return new Promise((resolve, reject) => {
            this.bindButtons(document.querySelector('.selection.pl' + p), resolve, p);
        });
    }

    bindButtons (rootElement, resolve, p) {
        const buttons = rootElement.querySelectorAll('button.play');
    
        buttons.forEach(button => {
            button.addEventListener('click', event => {
                let valid = true;
                // resolve(event.target.getAttribute("data-playType"));
                if (DEF_PLAYS[event.target.getAttribute("data-playType")]['type'] === 'reg') {
                    const errorMsg = game.run.playValid(game, p, event.target.getAttribute("data-playType"));
                    if (errorMsg) {
                        game.run.alertBox(errorMsg);
                        valid = false;
                    } // else {makeButtons()}
                }
                if (valid) {
                    resolve(event.target.getAttribute("data-playType"));
                    event.target.parentElement.innerHTML = '';
                }
            });
        })
    }

    makeButtons(game, type, p) {
        let store = []; 
        let count = 0;

        for (let key in DEF_PLAYS) {
                if (DEF_PLAYS[key]['type'] === type) {
                    // add count here
                    store[count] = { 'name': DEF_PLAYS[key]['name'], 'abrv': DEF_PLAYS[key]['abrv'] };
                    count++;
                }
        }

        console.log(store);

        const buttonArea = document.querySelector('.selection.pl' + p);
        buttonArea.innerHTML = '';

        for (let i = 0; i < store.length; i++) {
            const btn = document.createElement("button");
            const t = document.createTextNode(store[i]['name']);
            btn.appendChild(t);
            btn.classList.add('play');
            // Set data-playType to play abrv, used throughout
            btn.setAttribute('data-playType', store[i]['abrv'])
            // Set the button to disabled if count is zero (prevents negatives)
            if (game.players[p].plays.hasOwnProperty(store[i]['abrv']) && game.players[p].plays[store[i]['abrv']]['count'] === 0) {
                btn.setAttribute('disabled', '')
            }
            // More validation can go here (for FG, PUNT)
            buttonArea.appendChild(btn);
        }
    }
}