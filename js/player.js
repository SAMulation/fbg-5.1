import Team from './team.js';

export default class Player {
    // need to access quarter from parent Game class
    // minimum req: Player(game, team)
    constructor(game, team, init = true, score = 0, time = 3, plays = null, hm = 3, stats = null) {
        this.game = game;
        this.team = new Team(team);
        this.score = score;
        this.timeouts = time;
        this.plays = plays;
        // this.mults = mults;  // Move me
        // this.yards = yards;  // Me too
        this.stats = stats;
        this.currentPlay = '';
        //this.isReal = true;
        this.hm = hm;  // This is hail mary, I'm moving this here

        if (init) {
            this.score = 0;
            if (this.game.qtr < 5) {
                this.timeouts = 3;
            } else {
                this.timeouts = 2;
            }
        }

        if (!plays) {
            this.fillPlays('a', this.game.qtr);
        }

        // if (!mults) {
        //     this.fillMults();
        // }

        // if (!plays) {
        //     this.fillYards();
        // }

        // LATER: Come up with Stats class
        // if (!stats) {
        //     this.stats = new Stats();
        // }
    }

    fillPlays(option, qtr = 4) {
        let hm = (qtr > 4 ? 2 : 3);

        if (option === 'a' || option === 'p') {
            // this.plays = [3, 3, 3, 3, 1];
            if (option === 'p') {  // cache hm
                hm = this.plays.HM.count
            }

            this.plays = {
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
                    'count': hm,
                    'type': 'reg'
                }
            }
            console.log('Refilling Play Cards');
        }

        // if (option === 'a') {
        //     // 3 hail marys by default per half
        //     this.hm = 3;
        //     // If OT, only 2 hail marys
        //     if (qtr > 4) {
        //         this.hm = 2;
        //     }
        // }
    }

    decPlays(idx) {
        if (idx === 'HM') {  // 5) {  // HM
            this.hm--;
        } else {
            this.plays[idx]['count']--;

            // if (this.plays[idx] <= 0) {

                // const refill = this.plays.every(play => {
                //     return play <= 0;
                // });
                
                // // Check to see if the plays array is empty
                // this.plays.forEach(play => {
                //     if (play > 0) {
                //         refill = false;
                //     }
                // });
                
                // if (refill) {
                //     this.fillPlays('p');
                // }
            // if (this.plays.every(play => play['count'] <= 0)) {
            //     this.fillPlays('p');
            // }
            let fill = true;
            for (let play in this.plays) {
                if (play !== 'HM' && this.plays[play]['count'] > 0) {
                    fill = false;
                    return;
                }
            }

            if (fill) {
                this.fillPlays('p');
            }
            // }
        }
    }

        // NEXT get, set, dec

    // fillMults() {
    //     this.mults = [4, 4, 4, 3];
    // }

    // // NEXT get, set, dec

    // fillYards() {
    //     this.yards = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    // }

    //     // NEXT get, set, dec

    // get(attr) {
    //     return this[attr];
    // }

    // set(attr, value) {
    //     this[attr] = value;
    // }
}
