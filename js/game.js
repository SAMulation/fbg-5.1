import Player from './player.js'
import Play from './play.js'

export default class Game {
    constructor(team1, team2, game_type, num_plr, away, home, mults = null, yards = null) {
        //                  qtr_length, rec_first, qtr=1, score1=0,
        //                  score2=0,
        //                  time1=3, time2=3, plays1=None, plays2=None,
        //                  mults1=None, mults2=None, yards1=None,
        //                  yards2=None,
        //                  stats1=None, stats2=None) {
        this.game_type = game_type;
        this.num_plr = num_plr;
        this.away = away;
        this.home = home;
        // this.current_time = 7;  // qtr_length;
        // this.off_num = this.opp(rec_first);  // Because this is the kicking team at initial kickoff
        // this.def_num = rec_first;
        this.down = 1;
        this.fst_down = 45;
        this.last_call_to = 0;
        this.ot_poss = -1;
        this.qtr = 1;
        this.qtr_length = 7;
        this.rec_first = 2;
        this.spot = 35;
        this.status = 11 ; // Defined elsewhere, diff nums for diff plays
        this.time_change = 0;  // Define later
        this.turnover = false;
        this.two_min = false;
        this.two_point = false;
        this.off_num = this.opp(this.rec_first);
        this.def_num = this.rec_first;
        this.current_time = this.qtr_length;
        this.thisPlay = new Play();
        this.players = {1: new Player(this, team1), 2: new Player(this, team2)};  // Object {1: ..., 2: ...}
        this.mults = mults; 
        this.yards = yards;

        if (!this.mults) {
            this.fillMults();
        }

        if (!this.plays) {
            this.fillYards();
        }
    }

    // get(attr) {
    //     return this[attr];
    // }

    // getpl(plr, attr) {
    //     return this.players[plr].get(attr);
    // }

    // set(attr, value) {
    //     this[attr] = value;
    // }

    // setpl(plr, attr, value) {
    //     this.players[plr].set(attr, value);
    // }

    opp(num) {
        return num === 1 ? 2 : 1;
    }

    isReal(num) {
        return num === 1 || this.num_plr === 2;
    }

    isOT() {
        return this.qtr > 4;
    }

    fillMults() {
        this.mults = [4, 4, 4, 3];
    }

    randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    }

    decMults() {
        let card = -1;
      
        while (card === -1) {
            card = this.randInt(0, 3);
            // Out of this card, try again
            if (!this.mults[card]) {
                card = -1;
            } else {
                this.mults[card]--;

                // Check if mults is empty
                if (this.mults[card] <= 0) {
                    let refill = true;
                    // Check to see if the plays array is empty
                    this.mults.forEach(mult => {
                        if (mult > 0) {
                            refill = false;
                        }
                    });
                    
                    if (refill) {
                        this.fillMults();
                    }
                }
            }
        }

        const cards = ["King", "Queen", "Jack", "10"];

        return {'card': cards[card], 'num': card + 1}
    }

    decYards() {
        let card = -1;

        while (card === -1) {
            card = this.randInt(0,9);

            if (!this.yards[card]) {
                card = -1;
            } else {
                this.yards[card]--;

                // Check if yards is empty
                if (this.yards[card] <= 0) {
                    let refill = true;
                    // Check to see if the plays array is empty
                    this.yards.forEach(yard => {
                        if (yard > 0) {
                            refill = false;
                        }
                    });
                    
                    if (refill) {
                        this.fillYards();
                    }
                }
            }
        }

        return card + 1;
    }

    // NEXT get, set, dec

    fillYards() {
        this.yards = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    }

        // NEXT get, set, dec
}

// LATER
//     def call_time(self, pl):
//         self.set_plr(pl, "timeouts", self.get_plr(pl, "timeouts"))

//     def save(self, filename):
//         # json_string = json.dumps(self.__dict__)
//         # json_file = open("game.json", "w")
//         # json_file.write(json_string)
//         # json_file.close()

//         save_array = [0, 0, 0, 0, 0]

//         save_array[0] = self.get_team_ch(1)
//         save_array[1] = self.get_team_ch(2)

//         save_array[2] = self.get_plr_ch(1).__dict__
//         self.get_plr_ch(1).set("team2", 0)
//         self.get_plr_ch(2).set("team2", 0)
//         save_array[2] = self.get_plr_ch(1).__dict__
//         save_array[3] = self.get_plr_ch(2).__dict__

//         self.set("players", [0, 1, 2])
//         self.set("this_play", None)
//         save_array[4] = self.__dict__

//         json_string = json.dumps(save_array)
//         json_file = open(filename + ".json", "w")
//         json_file.write(json_string)
//         json_file.close()

//         self.load(filename)

//     def load(self, filename):
//         # json_file = open("game.json", "r")
//         # json_content = json_file.read()
//         # json_list = json.loads(json_content)
//         # key_list = self.__dict__.keys()
//         #
//         # for key in key_list:
//         #     setattr(self, key, json_list.get(key))

//         json_file = open(filename + ".json", "r")
//         json_content = json_file.read()
//         json_list = json.loads(json_content)
//         json_file.close()
//         key_list = json_list[4].keys()

//         team1 = json_list[0]
//         team2 = json_list[1]
//         plr1 = json_list[2]
//         plr2 = json_list[3]
//         game = json_list[4]

//         self.__init__(team1, team2, game.get("game_type"), game.get("num_plr"), game.get("away"),
//                       game.get("home"), game.get("qtr_length"), game.get("rec_first"), game.get("qtr"),
//                       plr1.get("score"),
//                       plr2.get("score"), plr1.get("timeouts"), plr2.get("timeouts"), plr1.get("plays"),
//                       plr2.get("plays"),
//                       plr1.get("mults"), plr2.get("mults"), plr1.get("yards"), plr2.get("yards"), plr1.get("stats"),
//                       plr2.get("stats"))

//         for key in game:
//             if key != "players" and key != "this_play":
//                 setattr(self, key, game[key])