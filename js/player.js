import Team from './team.js';

export default class Player {
    // need to access quarter from parent Game class
    // minimum req: Player(game, team)
    constructor(game, team, init = true, score = 0, time = 3, plays = null, mults = null, yards = null, stats = null) {
        this.game = game;
        this.team = new Team(team.name, team.get('city'), team.get('abrv'));
        this.score = score;
        this.timeouts = time;
        this.plays = plays;
        this.mults = mults;  // Move me
        this.yards = yards;  // Me too
        this.stats = stats;
        this.currentPlay = '';
        //this.isReal = true;

        if (init) {
            this.score = 0;
            if (this.game.get('qtr') < 5) {
                this.timeouts = 3;
            } else {
                this.timeouts = 2;
            }
        }

        if (!plays) {
            this.fillPlays('a', this.game.get('qtr'));
        }

        if (!mults) {
            this.fillMults();
        }

        if (!plays) {
            this.fillYards();
        }

        // LATER: Come up with Stats class
        // if (!stats) {
        //     this.stats = new Stats();
        // }
    }

    fillPlays(option, qtr = 4) {
        // 3 hail marys by default per half
        let hm = 3;
        // If OT, only 2 hail marys
        if (qtr > 4) {
            hm = 2;
        }

        if (option === 'a') {
            this.plays = [3, 3, 3, 3, 1, hm];
        } else if (option === 'h') {
            this.plays[5] = hm;  // Resetting hm only
        }
    }

        // NEXT get, set, dec

    fillMults() {
        this.mults = [4, 4, 4, 3];
    }

    // NEXT get, set, dec

    fillYards() {
        this.yards = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

        // NEXT get, set, dec

    get(attr) {
        return this[attr];
    }

    set(attr, value) {
        this[attr] = value;
    }
}
