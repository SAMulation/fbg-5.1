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
        if (option === 'a' || option === 'p') {
            this.plays = [3, 3, 3, 3, 1];
            console.log('Refilling Play Cards');
        }

        if (option === 'a') {
            // 3 hail marys by default per half
            this.hm = 3;
            // If OT, only 2 hail marys
            if (qtr > 4) {
                this.hm = 2;
            }
        }
    }

    decPlays(idx) {
        if (idx === 5) {  // HM
            this.hm--;
        } else {
            if (this.plays[idx] <= 0) {
                let refill = true;
                // Check to see if the plays array is empty
                this.plays.forEach(play => {
                    if (play > 0) {
                        refill = false;
                    }
                });
                
                if (refill) {
                    this.fillPlays('p');
                }
            }
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
