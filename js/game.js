import Player from './player.js'
import Play from './play.js'
import Run from './run.js'
import ButtonInput from './buttonInput.js'
import Utils from './remoteUtils.js'
import { CHANGE, INIT, INIT_OTC } from './defaults.js'

export default class Game {
  constructor (connection, team1, team2, numberPlayers, gameType, home, qtrLength, stats1, stats2, input = new ButtonInput(), mults = null, yards = null) {
    this.gameType = gameType
    this.numberPlayers = numberPlayers
    this.home = home
    this.away = this.opp(this.home)
    this.down = 0
    this.firstDown = null
    this.lastCallTO = 0
    this.otPoss = -1
    this.over = false
    this.qtr = 0
    this.qtrLength = qtrLength
    this.recFirst = null // Set in coin toss
    this.spot = 65
    this.status = INIT // Defined in defaults.js, diff nums for diff plays
    this.changeTime = CHANGE // Defined in defaults.js, diff nums for diff states of time change
    this.turnover = false
    this.twoMinWarning = false
    this.twoPtConv = false
    this.offNum = this.opp(this.recFirst)
    this.defNum = this.recFirst
    this.currentTime = this.qtrLength
    this.thisPlay = new Play()
    this.players = { 1: new Player(this, team1, stats1), 2: new Player(this, team2, stats2) }
    this.mults = mults
    this.yards = yards
    this.lastSpot = this.spot
    this.recap = []
    this.me = connection.me
    this.statusOnExit = INIT
    this.lastPlay = 'Start of game'

    this.connection = connection

    // Pass input class to game constructor
    this.run = new Run(this, input)

    if (!this.mults) {
      this.fillMults()
    }

    if (!this.plays) {
      this.fillYards()
    }

    if (this.gameType === 'otc') {
      this.status = INIT_OTC
    }
  }

  async runIt (channel) {
    await this.run.playGame(this.connection)
  }

  opp (num) {
    return num === 1 ? 2 : 1
  }

  isReal (num) {
    return this.numberPlayers !== 0 && (num === 1 || this.numberPlayers === 2)
  }

  isOT () {
    return this.qtr > 4
  }

  isPlayer (p, cond) {
    if (cond === 'local') {
      return p === this.me || this.connection.connections[p] === 'local'
    } else if (cond === 'host') {
      return this.connection.connections[p] === 'host'
    } else if (cond === 'remote') {
      return this.connection.connections[p] === 'remote'
    }
  }

  fillMults () {
    this.mults = [4, 4, 4, 3]
  }

  async decMults (p = null) {
    let card = -1

    while (card === -1) {
      card = await Utils.randInt(0, 3, this, p)

      // Out of this card, try again
      if (!this.mults[card]) {
        card = -1
      } else {
        this.mults[card]--

        // Check if mults is empty
        if (this.mults[card] <= 0) {
          let refill = true
          // Check to see if the plays array is empty
          this.mults.forEach(mult => {
            if (mult > 0) {
              refill = false
            }
          })

          if (refill) {
            this.fillMults()
          }
        }
      }
    }

    // LATER: Clean up how multiplier cards are represented
    const cards = ['King', 'Queen', 'Jack', '10']

    return { card: cards[card], num: card + 1 }
  }

  async decYards (p = null) {
    let card = -1

    while (card === -1) {
      card = await Utils.randInt(0, 9, this, p)

      if (!this.yards[card]) {
        card = -1
      } else {
        this.yards[card]--

        // Check if yards is empty
        if (this.yards[card] <= 0) {
          let refill = true
          // Check to see if the plays array is empty
          this.yards.forEach(yard => {
            if (yard > 0) {
              refill = false
            }
          })

          if (refill) {
            this.fillYards()
          }
        }
      }
    }

    return card + 1
  }

  fillYards () {
    this.yards = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  }

  callTime (p) {
    this.players[p].timeouts--
    return this.players[p].timeouts + 1 // Stop showing this timeout
  }
}
