

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
    // minimum req: Player(team, qtr)
    constructor(team, qtr, init = true, score = 0, time = 3, plays = null, mults = null, yards = null, stats = null) {
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
            if (qtr < 5) {
                this.timeouts = 3;
            } else {
                this.timeouts = 2;
            }
        }

        if (!plays) {
            this.fillPlays('a', qtr);
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

let testTeam = new Team('Rams', 'Los Angeles', 'LAR');
console.log(testTeam.getTeam());

let testPlayer = new Player(testTeam);
console.log(testPlayer.get('team').getTeam());