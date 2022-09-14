

class Team {
    constructor(name = 'Name', city = 'City', abrv = 'FBG') {
        this.name = name;
        this.city = city;
        this.abrv = abrv;    
    }

    get(attr) {
        return this[attr];
    }

    getTeam() {
        return {
            'name': this.name,
            'city': this['city'],
            'abrv': this['abrv']
        }
    }

    set(attr, value) {
        this[attr] = value;
    }

    setTeam(team) {
        keys(team).forEach(attr => {
            this[attr] = team[attr];
        });
    }
}

class Player {
    // qtr gets passed at construction call
    // minimum req: Player(game, team)
    constructor(game, team, init = true, score = 0, time = 3, plays = null, mults = null, yards = null, stats = null) {
        this.game = game;
        this.team = new Team(team.get('name'), team.get('city'), team.get('abrv'));
        this.score = score;
        this.timeouts = time;
        this.plays = plays;
        this.mults = mults;
        this.yards = yards;
        this.stats = stats;
        this.currentPlay = '';

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

    // getTeam() {
    //     return {
    //         'name': this['name'],
    //         'city': this['city'],
    //         'abrv': this['abrv']
    //     }
    // }

    // get(attr) {
    //     return this[attr];
    // }

    // set(attr, value) {
    //     this[attr] = value;
    // }
}

// class Player(object):
//     def __init__(self, team, qtr, score=0, time=3, plays=None, mults=None, yards=None, stats=None):
//         self.team = Team(team)
//         self.score = score
//         self.timeouts = time
//         self.plays = plays
//         self.mults = mults
//         self.yards = yards
//         self.stats = stats
//         self.current_play = ""

//         if not plays:
//             self.fill_plays("a", qtr)

//         if not mults:
//             self.fill_mults()

//         if not yards:
//             self.fill_yards()

//         if score != 0:
//             self.score = score

//         if time == 3 and qtr > 4 or qtr <= 4 and time != 3:
//             self.timeouts = time

//         if stats:
//             # LATER Do stats here
//             pass

//     def fill_plays(self, option, qtr=4):
//         hm = 3
//         if qtr > 4:
//             hm = 2

//         if option == "a":
//             self.plays = [3, 3, 3, 3, 1, hm]
//         elif option == "h":
//             self.plays[5] = hm

//     def fill_mults(self):
//         self.mults = [4, 4, 4, 3]

//     def get_mults(self):
//         return self.get("mults")

//     def dec_mults(self):
//         card = -1
//         while card == -1:
//             card = random.randint(0, 3)
//             if not self.mults[card]:
//                 card = -1
//             else:
//                 self.mults[card] -= 1

//                 if sum(self.get("mults")) <= 0:
//                     self.fill_mults()
//         cards = ["King", "Queen", "Jack", "10"]

//         return {"card": cards[card], "num": card + 1}

//     def get_yards(self):
//         return self.get("yards")

//     def dec_yards(self):
//         card = -1
//         while card == -1:
//             card = random.randint(0, 9)
//             if not self.yards[card]:
//                 card = -1
//             else:
//                 self.yards[card] -= 1

//                 if sum(self.get("yards")) <= 0:
//                     self.fill_yards()

//         return card + 1

//     def fill_yards(self):
//         self.yards = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

//     def get_plays(self, num):
//         return self.get("plays")[num]

//     # Returns Boolean to validate
//     def dec_plays(self, num):
//         if self.get_plays(num) <= 0:
//             ret = False
//             if sum(self.get("plays")) <= 0:
//                 self.fill_plays("a")  # CHECK This might need to be a more universal function
//                 ret = -1
//         else:
//             self.get("plays")[num] -= 1
//             ret = self.get_plays(num)
//             if sum(self.get("plays")) <= 0:
//                 self.fill_plays("a")  # CHECK This might need to be a more universal function
//                 ret = -1

//         return ret

//     def get(self, key):
//         if key == "team":
//             return self.__getattribute__(key).get_team()
//         else:
//             return self.__getattribute__(key)

//     def set(self, key, val):
//         if key == "stats":  # LATER Fix this
//             return
//         elif key == "team":
//             self.team = Team(val)  # You're actually passing the team here
//         elif key == "team2":
//             self.__setattr__("team", val)
//         else:
//             self.__setattr__(key, val)

//     def get_team(self, key):
//         return self.__getattribute__("team").get(key)

class Game {
    constructor(team1, team2, game_type, num_plr, away, home) {
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
        this.rec_first = 1;
        this.spot = 35;
        this.status = 11 ; // Defined elsewhere, diff nums for diff plays
        this.time_change = 0;  // Define later
        this.turnover = false;
        this.two_min = false;
        this.two_point = false;
        this.off_num = this.opp(this.rec_first);
        this.def_num = this.rec_first;
        this.current_time = this.qtr_length;
        this.thisPlay = '';
        this.players = [0, new Player(this, team1), new Player(this, team2)];  // Placeholder at zero index
    }

    get(attr) {
        return this[attr];
    }

    getpl(plr, attr) {
        return this.players[plr].get(attr);
    }

    set(attr, value) {
        this[attr] = value;
    }

    setpl(plr, attr, value) {
        this.players[plr].set(attr, value);
    }

    opp(num) {
        return num === 1 ? 2 : 1;
    }

    isReal(num) {
        return num === 1 || this.get('num_plr') === 2;
    }

    isOT() {
        return this.get('qtr') > 4;
    }
}

// class Game(object):
//     def __init__(self, team1, team2, game_type, num_plr, away, home,
//                  qtr_length, rec_first, qtr=1, score1=0,
//                  score2=0,
//                  time1=3, time2=3, plays1=None, plays2=None,
//                  mults1=None, mults2=None, yards1=None,
//                  yards2=None,
//                  stats1=None, stats2=None):
//         self.players = [0, 0, 0]  # Placeholder at zero index
//         self.players[1] = Player(team1, qtr, score1, time1, plays1, mults1, yards1, stats1)
//         self.players[2] = Player(team2, qtr, score2, time2, plays2, mults2, yards2, stats2)

//         self.game_type = game_type
//         self.num_plr = num_plr
//         self.away = away
//         self.home = home
//         self.current_time = qtr_length
//         self.off_num = self.opp(rec_first)  # Because this is the kicking team at initial kickoff
//         self.def_num = rec_first
//         self.down = 1
//         self.fst_down = 45
//         self.last_call_to = 0
//         self.ot_poss = -1
//         self.qtr = 1
//         self.qtr_length = qtr_length
//         self.rec_first = rec_first
//         self.spot = 35
//         self.status = 11  # Defined elsewhere, diff nums for diff plays
//         self.time_change = 0  # Define later
//         self.turnover = False
//         self.two_min = False
//         self.two_point = False

//         self.this_play = Play()  # Never going to save mid-play

//     def get(self, key):
//         return self.__getattribute__(key)

//     def get_play(self, key):
//         return self.__getattribute__("this_play").get(key)

//     def get_plr(self, pl, key):
//         return self.__getattribute__("players")[pl].get(key)

//     def get_plr_ch(self, pl):
//         return self.__getattribute__("players")[pl]

//     def get_team(self, pl, key):
//         return self.__getattribute__("players")[pl].get("team").get(key)

//     def get_team_ch(self, pl):
//         return self.__getattribute__("players")[pl].get("team")

//     def set(self, key, val):
//         self.__setattr__(key, val)

//     def set_play(self, key, val):
//         self.__getattribute__("this_play").set(key, val)

//     def set_plr(self, pl, key, val):
//         return self.__getattribute__("players")[pl].set(key, val)

//     def is_real(self, num):
//         return num == 1 or self.num_plr == 2

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

//     # Return the opposite of the number in question 1 vs. 2
//     def opp(self, num):
//         ret = 1

//         if num == 1:
//             ret = 2

//         return ret

//     def isot(self):
//         return self.get("qtr") > 4

class Play {
    bonus = 999;
    dist = 999;
    multiplier_card = 999;
    multiplier_num = 999;
    yard_card = 999;
    multiplier = 999;

    get(attr) {
        return this[attr];
    }

    set(attr, value) {
        this[attr] = value;
    }
}

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

function prePlay(game, stat) {
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


function two_min_check(game) {
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

function set_status(game, p1, p2) {
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

function pick_play(game) {
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