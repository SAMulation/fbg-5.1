import Team from './team.js';
// import Player from './player.js';
// import Play from './play.js';
import Game from './game.js';

class Site {
    constructor(root) {
        //this.game = new Game(TEAMS[25], TEAMS[2], 'reg', 2, 1, 2);
        this.team1 = '';
        this.team2 = '';
        this.qtrlen = '';
        // LATER: These won't autofill
        this.gamtyp = 'reg';
        this.numplr = 2;
    }

    // setTeamLists(root) {
    //     const lists = root.querySelectorAll('.teamList');
    //     lists.forEach(list => {
    //         // list.removeChild(list.firstElementChild);
    //         for (let t = 0; t < TEAMS.length; t++) {
    //             const team = TEAMS[t];
    //             const el = document.createElement('option');
    //             //el.value = team.city + " " + team.name;
    //             el.textContent = team.city + ' ' + team.name;
    //             //el.dataset.index = t;
    //             el.value = t;
    //             // console.log(el);
    //             list.appendChild(el);
    //         }
    //     });
    // }
    
    // submitTeams(root) {
    //     const submit = root.querySelector('input[type="submit"]');
    //     submit.addEventListener('pointerdown', event => {
    //         let el;
    //         let value = [-1, -1];
    //         let valid = true;
    //         console.log('submit');
    
    //         for (let t = 0; t < 2 && valid; t++) {
    //             el = document.getElementById('p' + (t + 1) + 'Team');
    //             console.log(el.selectedIndex);
    
    //             value[t] = el.selectedIndex;
    //             console.log("val: " + value[t]);
    //             // console.log("nan: " + NaN(value[t]));
    //             if (value[t] === 0) {
    //                 valid = false;
    //             } else {
    //                 // value[t]--;  //It's off by one because of 'Please select...' option
    //             }
    //             console.log("valid: " + valid)
    //             console.log('add some message to user warning of invalid choices')
    //         }
    
    //         if (valid && value[0] !== 0 && value[1] !== 0) {
    //             //let team1 = TEAMS[value[0]--];
    //             //console.log(team1['name']);
    //             //game = new Game(new Team(TEAMS[value[0]--]['name'], TEAMS[value[0]--]['city'], TEAMS[value[0]--]['abrv']), new Team(TEAMS[value[1]--].name, TEAMS[value[1]--].city, TEAMS[value[0]--].abrv), 'reg', 1, 2, 1);
    //             this.team1 = value[0];
    //             this.team2 = value[1];
    //             startGame(this);
    //         }
    //     });
    // }
}

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
]

// const LETTERS = 
window.LETTERS = ["SR", "LR", "SP", "LP", "TP", "HM", "FG", "PUNT", "RET", "XP", "2PT"];

const site = new Site(document);

// TEAMS ARE TEMP
let testTeam1 = new Team(window.TEAMS[24]);
console.log(testTeam1);

let testTeam2 = new Team('Seahawks', 'Seattle', 'SEA');
console.log(testTeam2.abrv);

let game = new Game(testTeam1, testTeam2, 'reg', 1, 2, 1);
console.log(game);

window.site = site;
window.game = game;

// FUNCTION DEFINITIONS

const prePlay = (game, stat) => {
    console.log('prePlay');
    game.thisPlay.multiplier_card = 999;
    game.thisPlay.multiplier_num = 999;
    game.thisPlay.yard_card = 999;
    game.thisPlay.multiplier = 999;
    game.thisPlay.dist = 999;
    game.thisPlay.bonus = 0;

    if (!(game.two_point && game.time_change === 4)) {
        game.time_change = 0;
    }

    if (game.turnover && game.down !== 1) {
        game.down = 1;
    }

    game.turnover = false;

    game.status = stat;

    if ((game.qtr === 2 || game.qtr === 4) && game.current_time === 2) {
        two_min_check(game);
    }   
}


const two_min_check = (game) => {
    let two_min = game.two_minute;
    let tim_chg;

    // Two-minute warning just ended
    if (two_min) {
        tim_chg = 0;
        two_min = false;

    // Two-minute warning needs to start
    } else {
        tim_chg = 9;
        two_min = true;
        console.log('Two-minute warning...');
    }

    game.time_change = tim_chg;
    game.two_minute = two_min;
}

const set_status = (game, p1, p2) => {
    let stat = 0;
    let ono = game.off_num;

    if ("SRLRSPLP".includes(p1)) {
        stat = 11;
    }

    if (!stat) {
        if (p1 === 'HM' || p2 === 'HM') {
            stat = 17;
        } else if (p1 === 'FG' || p2 === 'FG') {
            stat = 15;
        } else if (p1 === 'PUNT' || p2 === 'PUNT') {
            stat = 16;
        }
    }

    if (!stat) {
        if (p1 === 'TP') {
            stat = ono === 1 ? 12 : 13;
        } else if (p2 === 'TP') {
            stat = ono === 1 ? 13 : 12;
        } else {
            stat = 11;
        }
    }

    return stat;
}

const pick_play = (game) => {
    for (let p = 1; p <= 2; p++) {
        game.getpl(p).currentPlay = '';

        // Computer Stuff
        if (game.status !== 999 && !(game.isReal(2))) {
            // This is where the computer can call timeout or pick special play
            // # LATER Print that computer is picking play
            // if game.get("time_change") == 0:
            //     pass
            //     # LATER cpu_time(game, plrs)
            // # LATER cpu_play(game, plrs)   
        }

        while (game.players[p].currentPlay === '' && game.status !== 999) {
            if (game.isReal(p)) {
                play_pages(game, p);
            } else {
                //  cpu_pages(game, p)  // It used to say 'plrs' for second param investigate
            }
        }
        
    }

    // Making sure you didn't exit
    if (game.status !== 999) {
        let stat = set_status(game, game.players[1].currentPlay,game.players[2].currentPlay);
        game.status = stat;

        console.log("Both teams are lining up for the snap...")
    
    // Exit out of the game
    } else {
        console.log('Catch ya laterrrrr!');
    }
}


// # LATER Make this more graphically pleasing
// def load_play(pg):
//     if pg == 1:
//         print("a. SHORT RUN\ns. LONG RUN\nd. SHORT PASS\n")
//     elif pg == 2:
//         print("a. LONG PASS\ns. TRICK PLAY\nd. HAIL MARY\n")
//     elif pg == 3:
//         print("a. FIELD GOAL\ns. PUNT\n")
//     elif pg == 7:
//         print("a. REGULAR KICK\ns. ONSIDE KICK\nd. SQUIB KICK\n")
//     elif pg ==8:
//         print("a. REGULAR RETURN\ns. TOUCHBACK\n")
//     elif pg == 9:
//         print("a. EXTRA POINT\ns. TWO-POINT CONV\n")

// SITE FUNCTIONS
const setTeamLists = (lists) => {
    lists.forEach(list => {
        // list.removeChild(list.firstElementChild);
        for (let t = 0; t < TEAMS.length; t++) {
            const team = TEAMS[t];
            const el = document.createElement('option');
            //el.value = team.city + " " + team.name;
            el.textContent = team.city + ' ' + team.name;
            //el.dataset.index = t;
            el.value = t;
            // console.log(el);
            list.appendChild(el);
        }
    });
}

// Trying to only make list once
// const setTeamLists = (lists) => {
//     let lists;

//     for (let t = 0; t < TEAMS.length; t++) {
//         const team = TEAMS[t];
//         const el = document.createElement('option');
//         //el.value = team.city + " " + team.name;
//         el.textContent = team.city + ' ' + team.name;
//         //el.dataset.index = t;
//         el.value = t;
//         console.log(el);
//         for (let l = 0; l < 2; l++) {
//             lists[l].appendChild(el);
//         }
//     }

//     lists.forEach(list => {
//         // list.removeChild(list.firstElementChild);
//         list.appendChild(el);
//     });
// }

// const submitTeam = (submits, tms) => {
//     submits.forEach(submit => {
//         submit.addEventListener('pointerdown', event => {
//             console.log('Does this work?');
//             console.log(tms);
//             let plr;
//             event.preventDefault();
//             // const teamIndex = TEAMS[event.target.dataset.index];
//             // const team = new Team(team.name, team.city, team.abrv);
//             console.log(event.target.classList);
//             console.log(document.querySelector('#p1Team'));
//             console.log(document.querySelector('#p1Team').dataset.index);
//             //console.log(event.target);
//             //console.log(event.currentTarget);
//             if (event.currentTarget.parentNode.id === 'p1Team') {
//                 plr = 0;
//             } else {
//                 plr = 1;
//             }

//             // Check selection vs. list
//             for (let t = 0; t < TEAMS.length; t++) {
//                 const team = TEAMS[t];
//                 const el = document.createElement('option');
//                 el.value = team.city + " " + team.name;
//                 el.dataset.index = t;
//                 list.appendChild(el);
//             }

//             tms[plr] = event.target.dataset.index;
//             console.log(tms);
//             document.querySelector('.selection.pl' + plr.toString()).classList.toggle('hidden');
//             document.querySelector('p span.pl' + plr.toString()).textContent = tms[plr];
//             document.querySelector('p.pl' + plr.toString()).classList.toggle('hidden');
//         })
//     })
// }

const initGame = (site) => {
    return new Game(TEAMS[site.team1], TEAMS[site.team2], site.gamtyp, site.numplr, 1, 2);
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
                console.log('P' + (t + 1) + ' picked: ' + TEAMS[value[t] - 1].name);
                value[t]--;  //It's off by one because of 'Please select...' option
            }
            console.log("valid: " + valid)
            console.log('add some message to user warning of invalid choices')
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
            console.log('P1: ' + game.players[1].team.print + '\nP2: ' + game.players[2].team.print)
        }
    });
}

// const startGame = (site) => {
//     console.log(site);
// }






// prePlay(testGame, testGame.get('status'));
// console.log(testGame);

// Populate team list

//console.log(tempTeams);

//let testTeam1 = TEAMS[tempTeams[0]];
// console.log(testTeam1.getTeam());

//let testTeam2 = TEAMS[tempTeams[0]];
// console.log(testTeam2.getTeam());

// let testTeam2 = new Team('Rams', 'Los Angeles', 'LAR');
// console.log(testTeam2.getTeam());
// while (tempTeams[0] === -1 || tempTeams[1] === -1)  {
//     // waiting...
// }
// let testGame = new Game(testTeam1, testTeam2, 'reg', 1, 2, 1);
// console.log(testGame);

//let teams = [0, 0];

// let testTeam1 = new Team(window.TEAMS[24]);
// console.log(testTeam1);

// let testTeam2 = new Team('Seahawks', 'Seattle', 'SEA');
// console.log(testTeam2.abrv);

// let testGame = new Game(testTeam1, testTeam2, 'reg', 1, 2, 1);
// console.log(testGame);




// This happens at the start
setTeamLists(document.querySelectorAll('.teamList'));
submitTeams(document.querySelector('#gameForm'));

// This has to wait for something to happen first
//prePlay(game, testGame.status);
//console.log(testGame);