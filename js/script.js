import Team from './team.js';
// import Player from './player.js';
// import Play from './play.js';
import Game from './game.js';
import Site from './site.js';
// import Run from './run.js';
import TextInput from './text.js';
import Kickoff from './kickoff.test.js';
import ButtonInput from './button.js';



// GLOBAL VARIABLES
// const TEAMS = [ switch back later
window.TEAMS = [
    {'name': '49ers', 'city': 'San Francisco', 'abrv': 'SF'},
    {'name': 'Bears', 'city': 'Chicago', 'abrv': 'CHI'},
    {'name': 'Bengals', 'city': 'Cincinnati', 'abrv': 'CIN'},
    {'name': 'Bills', 'city': 'Buffalo', 'abrv': 'BUF'},
    {'name': 'Broncos', 'city': 'Denver', 'abrv': 'DEN'},
    {'name': 'Browns', 'city': 'Cleveland', 'abrv': 'CLE'},
    {'name': 'Buccaneers', 'city': 'Tampa Bay', 'abrv': 'TB'},
    {'name': 'Cardinals', 'city': 'Arizona', 'abrv': 'ARI'},
    {'name': 'Chargers', 'city': 'Los Angeles', 'abrv': 'LAC'},
    {'name': 'Chiefs', 'city': 'Kansas City', 'abrv': 'KC'},
    {'name': 'Colts', 'city': 'Indianapolis', 'abrv': 'IND'},
    {'name': 'Commanders', 'city': 'Washington', 'abrv': 'WAS'},
    {'name': 'Cowboys', 'city': 'Dallas', 'abrv': 'DAL'},
    {'name': 'Dolphins', 'city': 'Miami', 'abrv': 'MIA'},
    {'name': 'Eagles', 'city': 'Philadelphia', 'abrv': 'PHI'},
    {'name': 'Falcons', 'city': 'Atlanta', 'abrv': 'ATL'},
    {'name': 'Giants', 'city': 'New York', 'abrv': 'NYG'},
    {'name': 'Jaguars', 'city': 'Jacksonville', 'abrv': 'JAX'},
    {'name': 'Jets', 'city': 'New York', 'abrv': 'NYJ'},
    {'name': 'Lions', 'city': 'Detroit', 'abrv': 'DET'},
    {'name': 'Packers', 'city': 'Green Bay', 'abrv': 'GB'},
    {'name': 'Panthers', 'city': 'Carolina', 'abrv': 'CAR'},
    {'name': 'Patriots', 'city': 'New England', 'abrv': 'NE'},
    {'name': 'Raiders', 'city': 'Las Vegas', 'abrv': 'LV'},
    {'name': 'Rams', 'city': 'Los Angeles', 'abrv': 'LAR'},
    {'name': 'Ravens', 'city': 'Baltimore', 'abrv': 'BAL'},
    {'name': 'Saints', 'city': 'New Orleans', 'abrv': 'NO'},
    {'name': 'Seahawks', 'city': 'Seattle', 'abrv': 'SEA'},
    {'name': 'Steelers', 'city': 'Pittsburgh', 'abrv': 'PIT'},
    {'name': 'Texans', 'city': 'Houston', 'abrv': 'HOU'},
    {'name': 'Titans', 'city': 'Tennessee', 'abrv': 'TEN'},
    {'name': 'Vikings', 'city': 'Minnesota', 'abrv': 'MIN'}
];

window.DEF_PLAYS = {
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
    }
}

// const LETTERS = 
window.LETTERS = ["SR", "LR", "SP", "LP", "TP", "HM", "FG", "PUNT", "RET", "XP", "2PT"];

window.MATCHUP = [[5, 3, 3, 2],
                  [2, 4, 1, 2],
                  [3, 2, 5, 3],
                  [1, 2, 2, 4]];

window.MULTI = [[4, 3, 2, 1.5, 1],
                [3, 2, 1, 1, 0.5],
                [2, 1, 0.5, 0, 0],
                [0, 0, 0, -1, -1]];

const site = new Site(document);

// TEAMS ARE TEMP
let testTeam1 = new Team(window.TEAMS[24]);
console.log(testTeam1);

let testTeam2 = new Team('Seahawks', 'Seattle', 'SEA');
console.log(testTeam2.abrv);

let game = new Game(testTeam1, testTeam2, 'reg', 1, 2, 1);
console.log(game);

// FIX: REMOVE LATER - Set to window for easy access
window.site = site;
window.game = game;
// window.text = new TextInput();

// FUNCTION DEFINITIONS
// THIS IS THE TESTING FUNCTION, SOME DAY IT WILL WRAP THE ENTIRE GAME
const playGame = (game) => {
    //alert("You're about to start playing, but there really isn't a lot going on.\nIf you have questions, email me at samulation.dev@gmail.com");
    // while (game.status !== 999) {
    //     playMechanism(game);

    //     if (game.status !== 999) {
    //         endPlay(game);
    //     }
    // }
    
    // OLD
    // gameLoop(game, 0);

    game.runIt();

    console.log(game);

    // prePlay(game, game.status);
    // pickPlay(game);
};

// SITE FUNCTIONS
const setTeamLists = (lists) => {
    lists.forEach(list => {
        list.removeChild(list.firstElementChild);
        for (let t = 0; t < TEAMS.length; t++) {
            const team = new Team(TEAMS[t]);
            const el = document.createElement('option');
            //el.value = team.city + " " + team.name;
            el.textContent = team.print;
            //el.dataset.index = t;
            el.value = t;
            // console.log(el);
            list.appendChild(el);
            // console.log('what is t? ' + t)
        }
        list.selectedIndex = list.id === 'p1Team' ? 24 : 2;
    });
};

// const makePlayButtons = (p) => {
//     let playList =['Short Pass','AUDI','MAYBACK','FERRARI','TOYOTA'];   
//     //the array
//     function printBtn() {
//         for (var i = 0; i < listBrand.length; i++) {
//            var btn = document.createElement("button");
//            var t = document.createTextNode(listBrand[i]);
//            btn.appendChild(t);
//            document.body.appendChild(btn);
//         }
// }

const bindButtons = (rootElement) => {
    // Clear press or press and hold
    const buttons = rootElement.querySelectorAll('button.play');
    console.log(buttons)

    buttons.forEach(button => {
        // was click
        button.addEventListener('pointerdown', event => {
            // console.log(event.target);
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
        console.log('submit');

        for (let t = 0; t < 2 && valid; t++) {
            el = document.getElementById('p' + (t + 1) + 'Team');
            console.log(el.selectedIndex);

            value[t] = el.selectedIndex;
            console.log("val: " + value[t]);
            // console.log("nan: " + NaN(value[t]));
            if (value[t] === 0) {
                valid = false;
            } else {
                console.log('P' + (t + 1) + ' picked: ' + TEAMS[value[t]].name);
                // console.log(value[t]);  //It's off by one because of 'Please select...' option - not anymore
            }
            console.log("valid: " + valid);
            console.log('add some message to user warning of invalid choices');
        }

        if (valid && value[0] !== 0 && value[1] !== 0) {
            //let team1 = TEAMS[value[0]--];
            //console.log(team1['name']);
            //game = new Game(new Team(TEAMS[value[0]--]['name'], TEAMS[value[0]--]['city'], TEAMS[value[0]--]['abrv']), new Team(TEAMS[value[1]--].name, TEAMS[value[1]--].city, TEAMS[value[0]--].abrv), 'reg', 1, 2, 1);
            site.team1 = value[0];
            site.team2 = value[1];
            console.log(site);
            game = initGame(site);
            window.game = game;
            console.log(game);
            console.log('P1: ' + game.players[1].team.print + '\nP2: ' + game.players[2].team.print);
            document.querySelector('.playButton').disabled = false;
            document.querySelector('.playSubmit').disabled = true;
        }
    });
};

const pressPlayButton = (button) => {
    button.addEventListener('pointerdown', event => {
        playGame(window.game);
        event.target.setAttribute('disabled', '')
    });
};

const initGame = (site) => {
    return new Game(TEAMS[site.team1], TEAMS[site.team2], site.gamtyp, site.numplr, 1, 2);
};


// MAIN FUNCTION CALLS
setTeamLists(document.querySelectorAll('.teamList'));
submitTeams(document.querySelector('#gameForm'));
pressPlayButton(document.querySelector('.playButton'));
bindButtons(document.querySelector('.page-wrap'));

// window.kick = new Kickoff(game);

// // Test all kickoff choices
// const kickChoices = ['RK', 'OK', 'SK'];
// const retChoices = ['RR', 'OR', 'TB'];


// let store = [];
// let count = 0;

// for (let key in DEF_PLAYS) {
//     if (DEF_PLAYS[key]['type'] === 'reg') {
//        // console.log(key, DEF_PLAYS[key]);
//        store[count] = DEF_PLAYS[key]['name'];
//        count++;
//     }
//  }

//  console.log(store);


//         let el;
//         let value = [-1, -1];
//         let valid = true;
//         console.log('submit');

//         for (let t = 0; t < 2 && valid; t++) {
//             el = document.getElementById('p' + (t + 1) + 'Team');
//             //console.log(el.selectedIndex);

//             value[t] = t + 5; // el.selectedIndex;
//             console.log("val: " + value[t]);
//             // console.log("nan: " + NaN(value[t]));
//             if (value[t] === 0) {
//                 valid = false;
//             } else {
//                 console.log('P' + (t + 1) + ' picked: ' + TEAMS[value[t]].name);
//                 // console.log(value[t]);  //It's off by one because of 'Please select...' option - not anymore
//             }
//             console.log("valid: " + valid);
//             console.log('add some message to user warning of invalid choices');
//         }

//         if (valid && value[0] !== 0 && value[1] !== 0) {
//             //let team1 = TEAMS[value[0]--];
//             //console.log(team1['name']);
//             //game = new Game(new Team(TEAMS[value[0]--]['name'], TEAMS[value[0]--]['city'], TEAMS[value[0]--]['abrv']), new Team(TEAMS[value[1]--].name, TEAMS[value[1]--].city, TEAMS[value[0]--].abrv), 'reg', 1, 2, 1);
//             site.team1 = value[0];
//             site.team2 = value[1];
//             console.log(site);
//             game = initGame(site);
//             window.game = game;
//             console.log(game);
//             console.log('P1: ' + game.players[1].team.print + '\nP2: ' + game.players[2].team.print);
//             document.querySelector('.playButton').disabled = false;
//             document.querySelector('.playSubmit').disabled = true;
//         }

// window.butt = new ButtonInput();

