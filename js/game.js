import Player from './player.js'
import Play from './play.js'
import Run from './run.js'
import ButtonInput from './buttonInput.js'
import Utils from './remoteUtils.js'
import { CHANGE, INIT, INIT_OTC } from './defaults.js'
import PromptInput from './promptInput.js'
import FormInput from './formInput.js'

export default class Game {
  constructor (resume = null, connection = null, team1 = null, team2 = null, numberPlayers = 1, gameType = 'reg', home = 1, qtrLength = 7, animation = true, stats1 = null, stats2 = null, input = new ButtonInput(), mults = null, yards = null) {
    if (resume) {
      const tempGame = JSON.parse(resume)

      this.gameType = tempGame.gameType
      this.numberPlayers = tempGame.numberPlayers
      this.home = tempGame.home
      this.away = this.opp(this.home)
      this.down = tempGame.down
      this.firstDown = tempGame.firstDown
      this.lastCallTO = tempGame.lastCallTO
      this.otPoss = tempGame.otPoss
      this.over = tempGame.over
      this.qtr = tempGame.qtr
      this.qtrLength = tempGame.qtrLength
      this.recFirst = tempGame.recFirst
      this.spot = tempGame.spot
      this.status = tempGame.status
      this.changeTime = tempGame.changeTime
      this.turnover = tempGame.turnover
      this.twoMinWarning = tempGame.twoMinWarning
      this.twoPtConv = tempGame.twoPtConv
      this.offNum = tempGame.offNum
      this.defNum = tempGame.defNum
      this.currentTime = tempGame.currentTime
      this.thisPlay = new Play()
      this.players = { 1: new Player(JSON.parse(tempGame.players)[1], this, team1, stats1), 2: new Player(JSON.parse(tempGame.players)[2], this, team2, stats2) }
      this.mults = JSON.parse(tempGame.mults)
      this.yards = JSON.parse(tempGame.yards)
      this.lastSpot = tempGame.lastSpot
      this.recap = JSON.parse(tempGame.recap)
      this.statusOnExit = tempGame.statusOnExit
      this.lastPlay = tempGame.lastPlay
      this.animation = tempGame.animation
      this.connection = JSON.parse(tempGame.connection)
      if (this.connection.connections) {
        this.connection.connections = JSON.parse(this.connection.connections)
      }
      this.me = this.connection.me
      this.run = JSON.parse(tempGame.run)
    } else {
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
      this.players = { 1: new Player(null, this, team1, stats1), 2: new Player(null, this, team2, stats2) }
      this.mults = mults
      this.yards = yards
      this.lastSpot = this.spot
      this.recap = []
      this.me = connection.me
      this.statusOnExit = INIT
      this.lastPlay = 'Start of game'
      this.animation = animation
      this.connection = connection
    }

    // Pass input class to game constructor
    if (resume) {
      const tempRun = this.run
      let inputType = null

      // Get last input type used
      if (this.run.input === 'prompt') {
        inputType = new PromptInput()
      } else if (this.run.input === 'form') {
        inputType = new FormInput()
      } else {
        inputType = new ButtonInput()
      }
      this.run = new Run(this, inputType)

      // Reset the following values
      this.run.alert = tempRun.alert
      this.run.transmissions = JSON.parse(tempRun.transmissions)
      this.run.gameLog = JSON.parse(tempRun.gameLog)
    } else {
      this.run = new Run(this, input)
    }

    if (!this.mults) {
      this.fillMults()
    }

    if (!this.plays) {
      this.fillYards()
    }

    if (this.gameType === 'otc') {
      this.status = INIT_OTC
    }

    this.connection.toJSON = () => {
      return {
        channel: this.channel,
        connections: JSON.stringify(this.connections),
        gamecode: this.gamecode,
        host: this.host,
        me: this.me,
        pusher: null,
        type: this.type
      }
    }

    this.toJSON = () => {
      return {
        gameType: this.gameType,
        numberPlayers: this.numberPlayers,
        home: this.home,
        down: this.down,
        firstDown: this.firstDown,
        lastCallTO: this.lastCallTO,
        otPoss: this.otPoss,
        over: this.over,
        qtr: this.qtr,
        qtrLength: this.qtrLength,
        recFirst: this.recFirst,
        spot: this.spot,
        status: this.status,
        changeTime: this.changeTime,
        turnover: this.turnover,
        twoMinWarning: this.twoMinWarning,
        twoPtConv: this.twoPtConv,
        offNum: this.offNum,
        defNum: this.defNum,
        currentTime: this.currentTime,
        thisPlay: JSON.stringify(this.thisPlay), // null, // this.thisPlay,
        players: JSON.stringify({ 1: JSON.stringify(this.players[1]), 2: JSON.stringify(this.players[1]) }), // this.players,
        mults: JSON.stringify(this.mults), // this.mults,
        yards: JSON.stringify(this.yards), // this.yards,
        lastSpot: this.lastSpot,
        recap: JSON.stringify(this.recap), // this.recap,
        me: this.me,
        statusOnExit: this.status,
        lastPlay: this.lastPlay,
        animation: this.animation,
        connection: JSON.stringify(this.connection), // this.connection
        run: JSON.stringify(this.run)
      }
    }
  }

  async runIt (channel) {
    await this.run.playGame(this.connection)
  }

  opp (num) {
    return num === 1 ? 2 : 1
  }

  isMultiplayer () {
    return this.connection.type === 'host' || this.connection.type === 'remote' || this.connection.type === 'computer-host' || this.connection.type === 'computer-remote'
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
