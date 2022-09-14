import Team from './team.js';
// import Player from './player.js';
// import Play from './play.js';
import Game from './game.js';

// GLOBAL VARIABLES
const TEAMS = [
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

const LETTERS = ["SR", "LR", "SP", "LP", "TP", "HM", "FG", "PUNT", "RET", "XP", "2PT"]

// FUNCTION DEFINITIONS

const prePlay = (game, stat) => {
    console.log('prePlay');
    game.get('thisPlay').set('multiplier_card', 999);
    game.get('thisPlay').set('multiplier_num', 999);
    game.get('thisPlay').set('yard_card', 999);
    game.get('thisPlay').set('multiplier', 999);
    game.get('thisPlay').set('dist', 999);
    game.get('thisPlay').set('bonus', 0);

    if (!(game.get('two_point') && game.get('time_change') === 4)) {
        game.set('time_change', 0);
    }

    if (game.get('turnover') && game.get('down') !== 1) {
        game.set('down', 1);
    }

    game.set('turnover', false);

    game.set('status', stat);

    if ((game.get('qtr') === 2 || game.get('qtr') === 4) && game.get('current_time') === 2) {
        two_min_check(game);
    }   
}


const two_min_check = (game) => {
    let two_min = game.get('two_minute');
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

    game.set('time_change', tim_chg);
    game.set('two_minute', two_min);
}

const set_status = (game, p1, p2) => {
    let stat = 0;
    let ono = game.get('off_num');

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
        game.getpl(p).set('currentPlay', '');

        // Computer Stuff
        if (game.get('status') !== 999 && !(game.isReal(2))) {
            // This is where the computer can call timeout or pick special play
            // # LATER Print that computer is picking play
            // if game.get("time_change") == 0:
            //     pass
            //     # LATER cpu_time(game, plrs)
            // # LATER cpu_play(game, plrs)   
        }

        while (game.getpl(p).get('currentPlay') === '' && game.get('status') !== 999) {
            if (game.isReal(p)) {
                play_pages(game, p);
            } else {
                //  cpu_pages(game, p)  // It used to say 'plrs' for second param investigate
            }
        }
        
    }

    // Making sure you didn't exit
    if (game.get('status') !== 999) {
        let stat = set_status(game, game.getpl(1).get('currentPlay'),game.getpl(2).get('currentPlay'));
        game.set('status', stat);

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


let testTeam1 = new Team('Rams', 'Los Angeles', 'LAR');
console.log(testTeam1.getTeam());

let testTeam2 = new Team('Seahawks', 'Seattle', 'SEA');
console.log(testTeam2.getTeam());

let testGame = new Game(testTeam1, testTeam2, 'reg', 1, 2, 1);
console.log(testGame);

prePlay(testGame, testGame.get('status'));
console.log(testGame);