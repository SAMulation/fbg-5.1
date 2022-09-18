import Team from './team.js';
// import Player from './player.js';
// import Play from './play.js';
import Game from './game.js';
import Site from './site.js';


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

window.MATCHUP = [[5, 3, 3, 2],
                  [2, 4, 1, 2],
                  [3, 2, 5, 3],
                  [1, 2, 2, 4]];

window.MULTI = [[4, 3, 2, 1.5, 1],
                [3, 2, 1, 1, .5],
                [2, 1, .5, 0, 0],
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

// FUNCTION DEFINITIONS

// PLAY MECHANISM
const playMechanism = (game) => {
    // stat,p1,p2,spt,fdn,ono
    let stat, ono, p1, p2;

    prePlay(game, 11);
    pickPlay(game);

    stat = game.status;
    ono = game.off_num;
    p1 = game.players[1].currentPlay;
    p2 = game.players[2].currentPlay;
    console.log(stat);
    if (stat !== 999) {
        // lastChanceTO(stat, game.qtr, game.current_time, game.time_change);
        doPlay(game, stat, ono, p1, p2);
    }
}

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

const pickPlay = (game) => {
    console.log('pickPlay');
    for (let p = 1; p <= 2; p++) {
        game.players[p].currentPlay = '';

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
                playPages(game, p);
            } else {
                //  cpu_pages(game, p)  // It used to say 'plrs' for second param investigate
            }
        }
        
    }

    // Making sure you didn't exit
    if (game.status !== 999) {
        let stat = setStatus(game, game.players[1].currentPlay, game.players[2].currentPlay);
        game.status = stat;

        alert("Both teams are lining up for the snap...")
    
    // Exit out of the game
    } else {
        alert('Catch ya laterrrrr!');
        // console.log(game);
    }
}

const playPages = (game, p) => {
    let selection = null;
    let test = 'SRLRSPLPTPHMFGPT';
    // LATER: Use status to change validity based on play type
    // if (state === 'xp') {
    //     test = 'XP2P';
    // } else if (state === 'kick') {
    //     test = 'RKSKOK';
    // } else if (state === 'rec') {
    //     test = 'RRORTB';
    // }

    // Get message to display
    const options = loadPlay(p);
    // const options = loadPlay(state);  // LATER
    let errorMsg = null;

    // Get user input
    do {
        // selection = prompt(options, 'Put abbreviation here (e.g., "sr" for Short Run)');
        selection = prompt(options);
        if (selection) {
            selection = selection.toUpperCase();
            errorMsg = playValid(game, p, selection);
            if (errorMsg) {
                alert(errorMsg);
                selection = null;
            }
        } else {
            selection = 'EXIT';
            game.status = 999;
        }
        console.log(selection);
    } while (!test.includes(selection) && game.status !== 999);
    //console.log(selection);
    game.players[p].currentPlay = selection;
}

const playValid = (game, p, sel) => {
    console.log('playValid');
    let msg = null;
    const num = "SRLRSPLPTP".indexOf(sel) / 2;
    console.log(num);
    let tot = 0;

    if (sel === 'FG' || sel === 'PT') {
        tot = -1;
    } else if (sel === 'HM') {
        tot = game.players[p].hm;
    } else if (num !== -1) {
        tot = game.players[p].plays[num];
    }

    console.log(tot);

    if (num >= 0 && num <= 4) {
        if (tot === 0) {
            msg = 'No more ' + sel + ' left!';
        }
    }

    if (!msg && num === -1) {
        msg = 'Illegal play!';
    }

    if (!msg && num >= 6 && num <= 8 && game.def_num === p) {
        msg = (num === 8) ? "PUNT" : sel + ' not allowed on defense!';
    }

    if (!msg && sel === 'FG' && game.spot < 30) {
        msg = 'Way too far to kick a FG!';
    }

    if (!msg && sel === 'PT' && game.down !== 4) {
        msg = 'Punt only allowed on 4th down!';
    }

    if (!msg && sel === 'PT' && game.isOT()) {
        msg = "You can't punt in overtime!";
    }

    if (!msg && tot === -1 && game.two_point) {
        msg = 'Kicks are not allowed during 2-point!';
    }

    return msg;
}

const loadPlay = (p, state = 'reg') => {
    let options = game.players[1].team.abrv + ' ' + game.players[1].score + " | " + game.players[2].team.abrv + ' ' + game.players[2].score + '\n';
    options += game.down + ending(game.down) + ' & ' + downDist(game.fst_down, game.spot) + ' | ' + printTime(game.current_time) + ' | Ball on: ' + printSpot(game, game.spot) + '\n';
    options += game.players[p].team.name + ' pick your play:\n[SR] Short Run   [LR] Long Run   [SP] Short Pass\n[LP] Long Pass   [TP] Trick Play   [HM] Hail Mary\n[FG] Field Goal   [PT] Punt\n';
    // LATER: This will be vastly different in a graphical world
    if (state === 'xp') {
        options += game.players[p].team.name + ' pick your play:\n[XP] Extra Point\n[2P] Two Point Conversion\n';
    } else if (state === 'kick') {
        options += game.players[p].team.name + ' pick your play:\n[RK] Regular Kick\n[SK] Squib Kick\n[OK] Onside Kick\n';
    } else if (state === 'rec') {
        options += game.players[p].team.name + ' pick your play:\n[RK] Regular Returnb\n[OR] Onside Return\n[TB] Touchback\n';
    }

    return options;
}

const ending = (num) => {
    let ending = 'th';

    if (num === 1) {
        ending = 'st';
    } else if (num === 2) {
        ending = 'nd';
    } else if (num === 3) {
        ending = 'rd';
    }

    return ending;
}

const downDist = (f, s) => {
    let ending = f - s;

    if (f === 100) {
        ending = 'G';
    } else if (f === s) {
        ending = 'IN';
    }

    return ending;
}

const printTime = (time) => {
    const min = Math.trunc(time);
    const sec = (time - min === .5) ? '30' : '00';

    return min + ':' + sec;
}

const printSpot = (game, s) => {
    let spot = '50';
    // console.log(game.off_num);
    // console.log(game.players[1].team.abrv);
    // console.log(game.players[game.off_num].team.abrv);
    if (s < 50) {
        spot = game.players[game.off_num].team.abrv + ' ' + s;
    } else if (s > 50) {
        spot = game.players[game.def_num].team.abrv + ' ' + (100 - s);
    }

    return spot;
}

const setStatus = (game, p1, p2) => {
    let stat = 0;
    let ono = game.off_num;

    if ("SRLRSPLP".includes(p1) && "SRLRSPLP".includes(p2)) {
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

const doPlay = (game, stat, ono, p1, p2) => {
    // rplcpic boardtop
    console.log('doPlay');

    if (stat >= 11 && stat <= 13) {
        regPlay(game, p1, p2);        
    }

    stat = game.status;

    if (stat === 14) {
        samePlay();        
    } else if (stat >= 12 && stat <= 13) {
        trickPlay(stat);
    } else if (stat === 15) {
        fieldGoal(ono);
    } else if (stat === 16) {
        punt(ono, 16);
    } else if (stat === 17) {
        hailMary();
    }
}

const regPlay = (game, pl1, pl2) => {
    // hno = game.home;  // Used for scoreboard updating
    // let report = 'Here are the plays...\n' + pl1 + ' vs. ' + pl2;

    drawPlay(game, 1, pl1);
    drawPlay(game, 2, pl2);

    // If both players picked the same play, 50/50 chance of Same Play Mechanism
    if (pl1 === pl2) {
        if (pl1 === 'TP' || coinFlip()) {
            // 14 = Same Play
            game.status = 14;
        }
    }

    // alert(report);
}

const drawPlay = (game, plr, play) => {
    console.log('drawPlay');
    const cardNum = "SRLRSPLPTP".indexOf(play) / 2;
    game.players[plr].decPlays(cardNum);
    console.log(game.players[plr].plays);
}

// END OF PLAY - WE HAVE THE DATA, LET'S GO!!!
const endPlay = (game) => {
    const p1 = game.players[1].currentPlay;
    const p2 = game.players[2].currentPlay;

    if (game.status > 10 && game.status <= 14 || game.status === 17) {
        calcDist(game, p1, p2);

        console.log('Play over - ball is moving...');
        reportPlay(game, p1, p2);

        // if (!game.two_point && game.status < 15 || game.status > 16) {
        //     saveDist(game.off_num)  // LATER: When we have stats
        // }

        if (game.two_point) {
            game.spot = game.thisPlay.dist + game.spot;
        }

        checkScore(game, game.thisPlay.bonus, game.thisPlay.dist);

        console.log('Updating scoreboard...');
        if (!game.isOT() && game.ot_poss < 0 && !game.two_point && game.status < 15 || game.status == 17) {
            updateDown(game);
        }

        if (!game.two_point) {
            timeChange(game);
        }

        // alert('Teams huddling up...\nPress Enter...\n');

        if (game.status > 0 && game.status < 10) {
            game.status = 11;
        }
    }
}

const calcDist = (game, p1, p2) => {
    console.log('Drawing cards...')

    if (game.thisPlay.multiplier_card === 999) {
        game.thisPlay.multiplier_card = game.decMults();
    }

    if (game.thisPlay.yard_card === 999) {
        game.thisPlay.yard_card = game.decYards();
    }

    if (game.thisPlay.multiplier === 999) {
        game.thisPlay.multiplier = calcTimes(game, p1, p2, game.thisPlay.multiplier_card.num);
    }

    if (game.thisPlay.dist === 999) {
        game.thisPlay.dist = Math.round(game.thisPlay.yard_card * game.thisPlay.multiplier) + game.thisPlay.bonus;
    }

    // Check for touchdowns
    if (game.spot + game.thisPlay.dist >= 100) {
        game.thisPlay.bonus = game.thisPlay.dist;
        game.thisPlay.dist = 100 - game.spot;
        if (!game.two_point) {
            game.status = 101;
        }
    }

    // Check for safeties
    if (game.spot + game.thisPlay.dist <= 0) {
        game.thisPlay.bonus = game.thisPlay.dist;
        game.thisPlay.dist = -game.spot;
        if (!game.two_point) {
            game.status = 102;
        }
    }
}

const calcTimes = (game, p1, p2, multIdx) => {
    let p1Num = 'SRLRSPLPTP'.indexOf(p1) / 2;
    let p2Num = 'SRLRSPLPTP'.indexOf(p2) / 2;
    let match = 0;

    if (p1Num === 4 || p2Num === 4) {
        match = 1;
    } else {
        match = MATCHUP[game.off_num === 1 ? p1Num : p2Num][game.off_num === 1 ? p2Num : p1Num];
    }

    return MULTI[multIdx - 1][match - 1];
}

const reportPlay = (game, p1, p2) => {
    const tmp = game.thisPlay.multiplier === 999 ? '/' : null;

    alert('Player 1: ' + p1 + ' vs. Player 2: ' + p2 + '\nMultiplier Card: ' + game.thisPlay.multiplier_card.card + '\nYard Card: ' + game.thisPlay.yard_card + '\nMultiplier: ' + (tmp ? tmp : game.thisPlay.multiplier) + 'X\nDistance: ' + game.thisPlay.dist + ' yard' + (game.thisPlay.dist !== 1 ? 's' : '') + '\nTeams are huddling up. Press Enter...\n');
}

const checkScore = (game, bon, dst) => {
    const ono = game.off_num;
    const dno = game.def_num;
    const oname = game.players[ono].team.name;
    const dname = game.players[dno].team.name;
    let good = false;
    let coin;

    // Two-Point Conversion
    if (game.two_point) {
        if (game.spot + game.thisPlay.dist >= 100 && !game.turnover) {
            if (bon > dst) {
                good = true;
            } else if (bon === dst) {
                coin = coinFlip();

                if (coin) {
                    good = true;
                }
            }

            if (good) {
                alert(oname + ' 2-point conversion good!');
                scoreChange(game, ono, 2);
            } else {
                if (game.time_change < 2 || game.time_change > 3) {
                    alert(oname + ' 2-point conversion no good!');
                }
            }
        } else if (game.spot + dst <= 0 || game.spot + dst >= 100 && game.turnover) {
            // dno = ono;
            // dname = oname;

            alert(dname + ' returned 2-pt!!!');
            scoreChange(game, dno, 2);
        } else {
            if (game.time_change < 2 || game.time_change > 3) {
                alert(oname + ' 2-point conversion no good!');
            }
        }

        if (game.time_change < 2 || game.time_change > 3) {
            game.two_point = false;
            if (!game.isOT()) {
                game.status = -3;
            } else {
                game.status = 11;
            }
        }
    }

    if (game.status === 101) {
        // touchdown(game);
        alert('Congrats!\n\nYou scored a touchdown and broke the game. Come back later for more gameplay...\n');
    }
    
    if (game.status === 102) {
        // safety(game);
        alert('Congrats!\n\nYou scored a safety and broke the game. Come back later for more gameplay...\n');
    }
}

const scoreChange = (game, scrNo, pts) => {
    // This is going to include a lot of action
    // that will update the scoreboard

    // All that's needed for logic
    game.players[scrNo].score += pts;

    // Also add to the stats at this point
    // Add to the quarter score for the game recap
}

const updateDown = (game) => {
    let coin;

    if (game.down !== 0) {
        game.spot += game.thisPlay.dist;
    }

    // if (game.spt != 0 || game.status > 0 && game.status < 10) { // Update the spot }

    // Sticks
    if (game.spot === game.fst_down) {
        alert('Sticks...');
        coin = coinFlip();

        if (!coin) {
            alert('Almost!');
        }
    }

    if (game.down === 0) {
        coin = 1;
    }

    if (game.spot > game.fst_down || coin) {
        if (game.down !== 0) {
            alert('First down!');
            // print_down(game);
        }
        game.down = 1;

        if (game.spot > 90) {
            game.fst_down = 100;
        } else {
            game.fst_down = game.spot + 10;
        }

        // print_down(game);

        if (game.status > 10) {
            // LATER: Inc player's first downs here
        }

        coin = 1;
    }

    if (!coin && game.time_change !== 2) {
        game.down += 1;
    }

    if (game.down > 4) {
        alert('Turnover on downs!!!')
        change_poss(game, 'to');

        game.down = 1;
    }

    // print_down(game);
}

const timeChange = (game) => {
    console.log('timeChange');
    if (game.qtr <= 4 && game.time_change === 0) {
        game.current_time -= .5;
        console.log(game.current_time);
        // Inc TOP for offense
        // print_time(game.current_time);
    }

    // LATER: Add this for OT
    // if (game.ot_poss < 0) {
    //     if (game.isOT() && game.ot_poss_switch(qtr, ono, rec_first, ot_poss)) {
    //         change_poss(game, 'ot');
    //     } else {
    //         game.ot_poss_switch2()
    //         game.ot_poss = Math.abs(game.ot_poss) - 1;
    //     }
    // }

    if (game.qtr > 4 && game.ot_poss === 0) {
        game.current_time = -.5;
    }
}

// THIS IS THE TESTING FUNCTION, SOME DAY IT WILL WRAP THE ENTIRE GAME
const playGame = (game) => {
    alert("You're about to start playing, but there really isn't a lot going on.\nIf you have questions, email me at samulation.dev@gmail.com")
    while (game.status !== 999) {
        playMechanism(game);

        if (game.status !== 999) {
            endPlay(game);
        }
    }

    console.log(game);

    // prePlay(game, game.status);
    // pickPlay(game);
}

const gameLoop = (game, test) => {
    game.status = test;
    if (test === 0) {
        game.current_time = 0.5;
    }

    while (game.status < 900) {
        while (game.current_time >= 0 && game.status != 999) {
            //game.save('as-' + datetime.now().strftime("%m.%d.%Y-%H.%M.%S"))
            if (game.status < 0) {
                // kickoff(game.status);
            }

            if (game.status < 10 || game.two_point) {
                playMechanism(game);
            }

            if (game.status !== 999) {
                endPlay(game);
            }
        }

        if (game.status < 900) {
            gameCtrl(game);
        }
    }

    if (game.status === 999) {
        game.status = 0;
    }
}

// MISC FUNCTIONS
// This is from mdn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// Refactored to be an arrow function for consistency and renamed for convenience
const randInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

const coinFlip = () => {
    return randInt(0,1);
}

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
                value[t];  //It's off by one because of 'Please select...' option - not anymore
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
            console.log('P1: ' + game.players[1].team.print + '\nP2: ' + game.players[2].team.print);
            document.querySelector('.playButton').disabled = false;
            document.querySelector('.playSubmit').disabled = true;
        }
    });
}

const pressPlayButton = (button) => {
    button.addEventListener('pointerdown', event => {
        playGame(window.game);
    })
}

const initGame = (site) => {
    return new Game(TEAMS[site.team1], TEAMS[site.team2], site.gamtyp, site.numplr, 1, 2);
}


// MAIN FUNCTION CALLS
setTeamLists(document.querySelectorAll('.teamList'));
submitTeams(document.querySelector('#gameForm'));
pressPlayButton(document.querySelector('.playButton'));