import Team from './team.js';
import Game from './game.js';
import Site from './site.js';
import ButtonInput from './input.js';
import {TEAMS} from './teams.js'



// FIX: REMOVE LATER - Set to window for easy access
const site = new Site(document);
let game = null;
window.site = site;
window.game = game;

// FUNCTION DEFINITIONS
// THIS IS THE TESTING FUNCTION, SOME DAY IT WILL WRAP THE ENTIRE GAME
const playGame = async (game) => {
    await game.runIt();
    EnablePlayButton(document.querySelector('.playButton'));
};

// SITE FUNCTIONS
const setTeamLists = (lists) => {
    lists.forEach(list => {
        list.removeChild(list.firstElementChild);
        for (let t = 0; t < TEAMS.length; t++) {
            const team = new Team(TEAMS[t]);
            const el = document.createElement('option');
            el.textContent = team.print;
            el.value = t;
            list.appendChild(el);
        }
        list.selectedIndex = list.id === 'p1Team' ? 24 : 2;
    });
};

const bindButtons = (rootElement) => {
    const buttons = rootElement.querySelectorAll('button.play');
    console.log(buttons)

    buttons.forEach(button => {
        button.addEventListener('pointerdown', event => {
            game.run.buttonPress(event.target.getAttribute("data-playType"));
        });
    })
}

const submitTeams = (submit) => {
    submit.addEventListener('submit', event => {
        event.preventDefault();
        let el;
        let value = [-1, -1];
        let valid = true;

        for (let t = 0; t < 2 && valid; t++) {
            el = document.getElementById('p' + (t + 1) + 'Team');
            value[t] = el.selectedIndex;

            if (value[t] === -1) {
                valid = false;
            }
        }

        if (valid && value[0] !== -1 && value[1] !== -1) {
            site.team1 = value[0];
            site.team2 = value[1];
            game = initGame(site);
            window.game = game;
            document.querySelector('.playButton').disabled = false;
            document.querySelector('.playSubmit').disabled = true;
        }
    });
};

const pressPlayButton = (button) => {
    button.addEventListener('pointerdown', event => {
        playGame(window.game);
        event.target.setAttribute('disabled', '')
        document.querySelector('.page-subheader').innerHTML = '';
    });
};

const EnablePlayButton = (button) => {
    button.innerText = 'Play Again?';
    button.disabled = false;
    pressPlayButton(button);
};

const initGame = (site) => {
    return new Game(site.team1, site.team2, site.gamtyp, site.numplr, 1, 2);
};

// MAIN FUNCTION CALLS
setTeamLists(document.querySelectorAll('.teamList'));
submitTeams(document.querySelector('#gameForm'));
pressPlayButton(document.querySelector('.playButton'));
bindButtons(document.querySelector('.page-wrap'));