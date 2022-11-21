/* global Pusher, LZString */
/* global alert, debugger */

import Player from './player.js'
import Stat from './stat.js'
import Utils from './remoteUtils.js'
import { Queue } from './queue.js'
import { MULTI, MATCHUP, CHANGE, TB, PEN_DOWN, PEN_NO_DOWN, TIMEOUT, TWOMIN, SAFETY_KICK, KICKOFF, KICK, INIT, INIT_OTC, REG, OFF_TP, DEF_TP, SAME, FG, PUNT, HAIL, TWO_PT, TD, SAFETY, LEAVE, P1_WINS, P2_WINS, EXIT, TWOPT, OT_START, MODAL_MESSAGES } from './defaults.js'
import { alertBox, sleep, setBallSpot, setSpot, animationSimple, animationWaitForCompletion, animationWaitThenHide, animationPrePick, animationPostPick, resetBoardContainer, firstDownLine } from './graphics.js'

export default class Run {
  constructor (game, input) {
    this.game = game // Pointer to game object
    this.input = input
    this.alert = 'bar' // or 'alert' or 'console'
    this.startScreen = document.querySelector('.start-screen')
    this.scoreboardContainer = document.querySelector('.scoreboard-container')
    this.scoreboardContainerTopLeft = document.querySelector('.scoreboard-container .away-msg.top-msg')
    this.scoreboardContainerTopRight = document.querySelector('.scoreboard-container .home-msg.top-msg')
    this.scoreboardContainerBotLeft = document.querySelector('.scoreboard-container .away-msg.bot-msg')
    this.scoreboardContainerBotRight = document.querySelector('.scoreboard-container .home-msg.bot-msg')
    this.fieldContainer = document.querySelector('.field-container')
    this.field = this.fieldContainer.querySelector('.field')
    this.coinImage = this.field.querySelector('.coin')
    this.boardContainer = document.querySelector('.board-container')
    this.plCard1 = document.querySelector('.board-container .pl-card1')
    this.plCard2 = document.querySelector('.board-container .pl-card2')
    this.multCard = document.querySelector('.board-container .mult-card')
    this.yardCard = document.querySelector('.board-container .yard-card')
    // this.qualityContainer = document.querySelector('.board-container .quality-container')
    // this.timesContainer = document.querySelector('.board-container .times-container')
    this.cardsContainer = document.querySelector('.cards-container')
    this.actualCards = this.cardsContainer.querySelector('.cards')
    this.timeoutButton = this.cardsContainer.querySelector('.to-butt')
    this.alertMessage = this.cardsContainer.querySelector('.bar-msg')
    this.qualityContainer = document.querySelector('.call-quality-container')
    this.qualityHeader = this.qualityContainer.querySelector('.qual-header')
    this.qualityFooter = this.qualityContainer.querySelector('.qual-footer')
    this.qualityTable = this.qualityContainer.querySelector('.qual-table')
    this.qualityOffPlays = this.qualityTable.querySelectorAll('.off-play')
    this.qualityDefPlays = this.qualityTable.querySelectorAll('.def-play')
    this.timesContainer = document.querySelector('.times-reporter')
    this.timesHeader = this.timesContainer.querySelector('.times-header')
    this.timesFooter = this.timesContainer.querySelector('.times-footer')
    this.ball = document.querySelector('.field-container .ball')
    this.playerContainer = this.fieldContainer.querySelector('.player-container')
    this.defHelms = this.playerContainer.querySelectorAll('.def-helms > div')
    this.offHelms = this.playerContainer.querySelectorAll('.off-helms > div')
    this.homeCity = document.querySelector('.home-city')
    this.awayCity = document.querySelector('.away-city')
    this.tdAnim = this.fieldContainer.querySelector('.td-anim')
    this.firstAnim = this.fieldContainer.querySelector('.first-anim')
    this.firstStick = this.firstAnim.querySelector('.first-stick')
    this.loadingPanelText = document.querySelector('.start-screen-loading h1')
    this.docStyle = document.documentElement.style
    this.channel = null // This is the Pusher channel
    this.inbox = new Queue()
    this.transmissions = []
    this.gameLog = []
    this.p2Team = ''

    this.toJSON = () => {
      return {
        input: this.input.type,
        alert: this.alert,
        transmissions: JSON.stringify(this.transmissions),
        gameLog: JSON.stringify(this.gameLog)
      }
    }
  }

  makeBarSlideable (el) {
    document.querySelector('.bar-msg').disabled = true
    document.querySelector('.bar-msg').addEventListener('click', async () => {
      await animationWaitForCompletion(el, 'slide-down', !this.cardsContainer.classList.contains('slide-down'))

      if (this.cardsContainer.classList.contains('slide-down')) {
        this.timeoutButton.disabled = true
      } else {
        if (this.timeoutButton.timeouts && this.game.changeTime === CHANGE) {
          this.timeoutButton.disabled = false
        }
      }
    })
  }

  // async setBallSpot (run, forceSpot = null) {
  //   const newSpot = forceSpot || run.game.spot
  //   const lastSpot = run.game.lastSpot
  //   await sleep(100)
  //   console.log(run.field.offsetHeight)
  //   run.docStyle.setProperty('--ball-spot', (run.field.offsetHeight / 100 * ((100 - newSpot) + 48)) + 'px')
  //   await sleep(100)
  // }

  async prepareHTML (game) {
    // Initial field height
    this.docStyle.setProperty('--ball-spot', (100 - game.spot) + '%')
    this.docStyle.setProperty('--first-down', (100 - game.firstDown) + '%')
    window.addEventListener('resize', event => {
      this.docStyle.setProperty('--ball-spot', (100 - game.spot) + '%')
      this.docStyle.setProperty('--first-down', (100 - game.firstDown) + '%')
    })

    setSpot(this, game.resume ? game.spot : 65) // Place ball
    await setBallSpot(this)
    await this.moveBall(game, game.resume ? 'show' : 'show/clear')
    // await this.updateDown(game)
    // alert('Waiting for other game')
    if (game.isMultiplayer()) {
      // Initial message
      // if (game.connection.host) {
      //   await this.receiveInputFromRemote()
      //   await this.sendInputToRemote('We good...')
      // } else {
      //   await this.sendInputToRemote('Initial check-in... we must trade data')
      //   await this.receiveInputFromRemote()
      // }

      // Host gets player 2's team
      if (game.connection.host && this.p2Team !== 'pong') {
        game.players[2] = new Player(null, game, JSON.parse(this.p2Team))
      } else if (game.connection.host) {
        const team2 = await this.receiveInputFromRemote()
        console.log(team2)
        console.log(team2.value)
        game.players[2] = new Player(null, game, JSON.parse(team2))
      // Remote
      } else {
        await this.sendInputToRemote(JSON.stringify(game.players[1].team))
      }

      // Remote gets player 1's team and other game info
      if (game.connection.host) {
        await this.sendInputToRemote(JSON.stringify({ team: game.players[1].team, qtrlen: game.qtrLength, home: game.home }))
      } else {
        let tempData = await this.receiveInputFromRemote()
        console.log(tempData)
        tempData = JSON.parse(tempData)
        // Copy player '1' to actual player 2
        game.players[2] = new Player(null, game, game.players[1].team)
        game.players[1] = new Player(null, game, tempData.team)
        game.qtrLength = parseInt(tempData.qtrlen)
        game.home = parseInt(tempData.home)
        game.away = game.opp(game.home)
        if (game.numberPlayers) {
          game.me = 2
        }
      }
    }

    // Set teams' colors
    document.documentElement.style.setProperty('--away-color1', game.players[game.away].team.color1)
    document.documentElement.style.setProperty('--away-color2', game.players[game.away].team.color2)
    document.documentElement.style.setProperty('--home-color1', game.players[game.home].team.color1)
    document.documentElement.style.setProperty('--home-color2', game.players[game.home].team.color2)
    if (game.me) {
      document.documentElement.style.setProperty('--me-color1', game.players[game.me].team.color1)
      document.documentElement.style.setProperty('--me-color2', game.players[game.me].team.color2)
    }

    this.homeCity.innerText = game.players[game.home].team.city.toUpperCase()
    this.awayCity.innerText = game.players[game.away].team.city.toUpperCase()

    animationSimple(this.cardsContainer, 'slide-down') // Slide cards container down
    if (!game.resume) {
      await animationWaitForCompletion(this.scoreboardContainer, 'slide-up') // Slide scoreboard up
    } else {
      this.showBoard(game, this.scoreboardContainer)
    }
    this.actualCards.innerText = '' // Clear out default cards
    if (game.resume) {
      this.coinImage.classList.toggle('fade', true)
      this.coinImage.classList.toggle('hidden', true)
    }
    await animationWaitThenHide(this.startScreen, 'fade') // Slide away game setup screen
    this.makeBarSlideable(this.cardsContainer)
  }

  async multiplayerSetup () {

  }

  async playGame () {
    this.channel = this.game.connection.pusher.subscribe('private-game-' + this.game.connection.gamecode)
    this.channel.bind('client-value', (data) => {
      if (data.value === null || data.value === undefined) throw new Error('got empty value from remote')
      // this.inbox.enqueue(data.value)
      this.inbox.enqueue(data.value)
    })

    await new Promise((resolve, reject) => {
      this.channel.bind('pusher:subscription_succeeded', resolve)
      this.channel.bind('pusher:subscription_error', reject)
    })

    // Performing Initial Handshake
    if (this.game.isMultiplayer()) {
      console.log('subscription succeeded')
      this.loadingPanelText.innerText = 'Successfully connected to channel!'
      await sleep(500)

      this.loadingPanelText.innerText = 'Waiting for other player...'
      await sleep(500)

      if (this.game.connection.host) {
        let response = null
        let result = []
        do {
          await this.sendInputToRemote('ping')
          console.log('Host sent handshake')
          await Promise.race([sleep(5000), this.receiveInputFromRemote()]).then(value => {
            result = value
            console.log('Race result: ')
            console.log(result)
          })
          if (result) {
            response = result
          }
        } while (!response)
        this.p2Team = response
      } else {
        const handshake = await this.receiveInputFromRemote()
        console.log('Remote received handshake:')
        console.log(handshake)
        await this.sendInputToRemote('pong')
        console.log('Remote sent confirmation')
      }
      this.loadingPanelText.innerText = 'Successfully connected to other player!'
      await sleep(500)
      this.loadingPanelText.innerText = 'Loading game...'
    }

    // Set up environment
    await this.prepareHTML(this.game) // Set up game board and field

    // Load game up
    await this.gameLoop(this.game, this.game.status) // Start the game loop
  };

  async gameLoop (game, test = REG) {
    // Pass status into gameLoop for testing purposes
    // Can pass it 11 (REG) to just 'jump in' and test a play
    // *** Though, some stuff won't work cuz all the vars aren't set
    game.status = test

    // INIT, so set time to 0.5
    if (game.status === INIT) {
      game.currentTime = -0.5
    }

    // This is the game loop
    while (game.status < LEAVE) {
      if (game.status < LEAVE && !game.resume) {
        await this.gameControl(game)
      }
      while (game.currentTime >= 0 && game.status !== EXIT) {
        if (game.status <= KICK) {
          await this.kickoff(game)
        } else if ((game.status >= REG && game.status < TD) || game.twoPtConv) {
          await this.playMechanism(game)
        }

        if (game.status !== EXIT) {
          await this.endPlay(game)
        }
      }
    }

    if (game.status === EXIT) {
      game.status = game.statusOnExit // LATER: Wire in exits to store status here
    }
  };

  async gameControl (game) {
    // The game just started
    if ((game.status === INIT || game.status === INIT_OTC || game.status === OT_START) && !game.over()) {
      await this.coinToss(game)
      await this.resetVar(game)
      await animationWaitForCompletion(this.scoreboardContainer, 'slide-up', false)
    } else {
      // End of half
      if (!(game.qtr % 2) && !game.over()) {
        await this.resetVar(game)
      } else {
        await this.resetTime(game)
      }
    }
  };

  // Commented code will handle host/remote random decisions
  async handleRandomDecisions (game, p, result) {
    let value = null
    // const conf = null
    if (game.connection.host) {
      value = result
    } // else if (game.connection.type === 'remote') {
    // if (game.connection.host) {
    //   value = result
    //   game.connection.channel.trigger('client-send-msg', { value })
    //   conf = await game.connection.channel.trigger('client-send-msg', {})
    // // I'm waiting
    // } else {
    //   value = await game.connection.channel.trigger('client-send-msg', value)
    //   game.connection.channel.trigger('client-send-msg', { 'sent' })
    // }
    // }

    return value
  }

  // Sending message away
  async sendInputToRemote (value) {
    if (value === null || value === undefined) throw new Error('attempted to send empty value')
    this.gameLog.push('Sent from player ' + this.game.me + ': ' + value)
    this.transmissions.push({ msg: value, type: 'sent' })
    this.channel.trigger('client-value', { value })
    await sleep(100)
  }

  async justSend (value, expectedLogIndex = -1) {
    this.channel.trigger('client-value', { value, expectedLogIndex })
    await sleep(100)
  }

  async justReceive () {
    await sleep(100)
    const value = await this.inbox.dequeue()
    return value
  }

  // Receiving message
  async receiveInputFromRemote () {
    await sleep(100)
    console.log('inbox:')
    console.log(this.inbox.buffer)
    const value = await this.inbox.dequeue()
    this.transmissions.push({ msg: value, type: 'recd' })
    this.gameLog.push('Received from player ' + this.game.opp(this.game.me) + ': ' + value)
    return value
  }

  async remoteCommunication (game, p, value = null, msg = null) {
    if (game.connection.connections[p] === 'remote' || game.connection.connections[p] === 'host') {
      if (value !== null) {
      // Send value to REMOTE player
        await this.sendInputToRemote(value)
      } else {
        if (msg) {
          await alertBox(this, msg)
        }
        // Receive value from REMOTE player
        value = await this.receiveInputFromRemote()
      }
    }

    return value
  }

  async coinToss (game) {
    const awayName = game.players[game.away].team.name
    const homeName = game.players[game.home].team.name
    let coinPick = null
    let result = ''
    let actFlip = null
    let decPick = null
    let recFirst = 'away'

    await firstDownLine(this, 1)
    this.ball.classList.toggle('fade', true)

    console.log('Connection type: ' + game.connection.type + ', Connections[me]: ' + game.connection.connections[game.me])
    console.log(game.me + ' coinPick before: ' + coinPick)
    game.players[game.away].currentPlay = null
    coinPick = await this.input.getInput(game, game.away, 'coin', awayName + ' pick for coin toss...')
    console.log(game.me + ' coinPick after: ' + coinPick)

    // Show result
    result += awayName + ' chose ' + (coinPick === 'H' ? 'heads' : 'tails') + '... The toss!'
    await alertBox(this, result)
    if (game.qtr === 4) {
      alertBox(this, 'End of regulation!')
      this.coinImage.className = 'coin fade'
      this.coinImage.style.display = ''
      // await animationWaitForCompletion(this.coinImage, 'fade', false)
      this.coinImage.classList.toggle('fade', false)
    }

    this.coinImage.classList.toggle('flip')
    // await animationWaitForCompletion(this.coinImage, 'fade', false)
    await sleep(2000)
    console.log(game.me + ' actFlip before: ' + actFlip)

    actFlip = await Utils.coinFlip(game, game.me) ? 'H' : 'T'
    console.log(game.me + ' actFlip after: ' + actFlip)

    // Maybe away

    result = 'It was ' + (actFlip === 'H' ? 'heads' : 'tails') + '!'
    this.coinImage.classList.toggle('flip')
    if (actFlip === 'T') {
      this.coinImage.classList.toggle('tails')
    }
    // await animationWaitForCompletion(this.coinImage, 'fade', false)
    await alertBox(this, result)
    await sleep(1000)
    await animationWaitThenHide(this.coinImage, 'fade')
    await animationWaitForCompletion(this.ball, 'fade', false)
    console.log('checkpoint')

    console.log(game.me + ' decPick before: ' + decPick)
    game.players[actFlip === coinPick ? game.away : game.home].currentPlay = null
    decPick = await this.input.getInput(game, (actFlip === coinPick ? game.away : game.home), (game.qtr >= 4 ? 'kickDecOT' : 'kickDecReg'), (actFlip === coinPick ? awayName : homeName) + ' decide whether to kick or receive...')

    // if (game.connection.type === 'host' || game.connection.type === 'remote') {
    //   if ((actFlip === coinPick && game.away === game.me) || (actFlip !== coinPick && game.home === game.me)) {
    //     this.sendInputToRemote(decPick)
    //   } else {
    //     decPick = await this.receiveInputFromRemote()
    //   }
    // }

    console.log(game.me + ' decPick after: ' + decPick)

    // if (game.connection.connections[game.away] === 'computer') {
    //   decPick = await Utils.randInt(1, 2)
    //   if (game.qtr < 4) {
    //     decPick = decPick === 1 ? 'K' : 'R'
    //   } // else: Leave it as 1 or 2 for OT possession picking
    // }

    result = (actFlip === coinPick ? awayName : homeName) + ' '

    if (game.qtr >= 4) {
      if (decPick === '1') {
        result += 'get ball 1st'
      } else {
        result += 'get ball 2nd'
      }
    } else {
      if (decPick === 'K') {
        result += ' will kick'
      } else {
        result += ' will receive'
      }
    }

    result += '...'
    await alertBox(this, result)

    if ((actFlip === coinPick && (decPick === '2' || decPick === 'K')) || (coinPick !== actFlip && (decPick === '1' || decPick === 'R'))) {
      recFirst = 'home'
    }

    game.recFirst = recFirst === 'home' ? game.home : game.away
    game.defNum = game.recFirst // Because they're receiving first
    game.offNum = game.opp(game.defNum) // Because they're kicking

    if (game.qtr >= 4) {
      if (game.gameType !== 'otc') {
        // LATER: Might need this for graphic resetting
      }
      // game.status = REG // Should lead to first play MAYBE DON'T WANT THIS
      game.currentTime = 0
    }
  };

  addRecap (game, time, msg) {
    game.recap.push({ time, msg })
    // LATER: Add to recap element on page
  }

  async resetVar (game) {
    if (game.status === INIT || game.status === INIT_OTC) {
      this.printName(game, this.scoreboardContainer)

      for (let p = 1; p <= 2; p++) {
        game.players[p].score = 0
        game.players[p].stats = new Stat(game.players[p].stats)
        game.players[p].stats.qtrScore.push(0)
      }
      this.printScore(game, this.scoreboardContainer)

      this.addRecap(game, 'Start', 'Game Start')
    }

    // Refill cards later in the game
    let to = 3

    if (game.status !== INIT && game.status !== INIT_OTC) {
      game.fillYards()
      game.fillMults()
      game.players[1].fillPlays('a', game.qtr)
      game.players[2].fillPlays('a', game.qtr)

      if (game.qtr >= 4) {
        to = 1
      }
      game.players[1].timeouts = to
      game.players[2].timeouts = to
    }

    // Refill timeout pills
    for (let t = 1; t <= 3; t++) {
      for (let p = 1; p <= 2; p++) {
        this.scoreboardContainer.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + t).classList.toggle('called', t > to)
        // if (document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + t).classList.contains('called')) {
        //   document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + t).classList.remove('called')
        // }
      }
    }

    // Refill hail mary pills
    for (let h = 1; h <= 3; h++) {
      for (let p = 1; p <= 2; p++) {
        this.scoreboardContainer.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .hm' + h).classList.toggle('called', h > (game.qtr < 4 ? 3 : 2))
        // if (document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .hm' + h).classList.contains('called')) {
        //   document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .hm' + h).classList.remove('called')
        // }
      }
    }

    // LATER: IF NOT NEEDED, DELETE
    // if (game.qtr === 4 && game.gameType !== 'otc' && game.players[1].score === game.players[2].score) {
    //   await this.coinToss(game)
    // }

    game.down = 0
    await this.updateDown(game, -1) // Forces game to set itself up

    if (game.qtr <= 3) {
      game.status = KICK
    } else {
      if (game.recFirst !== game.offNum) {
        await this.changePoss(game)
      }
      game.status = REG
    }

    await this.resetTime(game)

    if (!game.over()) {
      if (game.qtr === 1) {
        await animationWaitForCompletion(this.scoreboardContainer, 'slide-up', false)
      }

      if (game.qtr === 3 && game.offNum !== game.recFirst) {
        await this.changePoss(game)
      }
    }
  };

  async resetTime (game) {
    // const over = game.qtr >= 4 && game.players[1].score !== game.players[2].score

    // Is the game over?
    if (game.over()) {
      await this.endGame(game)
    // No, then let's increase the quarter
    } else {
      if (game.qtr !== 0 && !(game.qtr === 4 && game.gameType === 'otc')) {
        for (let p = 1; p <= 2; p++) {
          let thisQtrScore = game.players[p].score

          for (let q = 0; q < game.players[p].stats.qtrScore.length; q++) {
            thisQtrScore -= game.players[p].stats.qtrScore[q]
          }
          game.players[p].stats.qtrScore.push(thisQtrScore)
        }
      }

      if (game.qtr !== 0 && (game.qtr !== 4 || game.gameType !== 'otc')) {
        await alertBox(this, 'End of ' + this.showQuarter(game.qtr) + (game.qtr > 4 ? '' : ' quarter'))

        if (!(game.qtr % 2)) {
          await alertBox(this, (game.qtr === 2 ? 'Halftime' : 'Overtime') + ' shuffle...')
          // LATER: Stat review statBoard(game);
        }
      }

      // Get ready for OT or reset clock for next qtr
      if (game.qtr >= 4) {
        game.currentTime = 0
        game.otPoss = 2
        game.spot = 75
        game.firstDown = 85
        await setBallSpot(this)
        this.printMsgDown(game, this.scoreboardContainer)
        this.printMsgSpot(game, this.scoreboardContainer)
        this.scoreboardContainer.querySelector('.clock .time').innerText = ''
      } else {
        game.currentTime = game.qtrLength
        await this.tickingClock('end', game.currentTime)
      }

      game.qtr++

      this.printQuarter(game, this.scoreboardContainer)

      if (game.isOT() && this.otQtrSwitch(game)) {
        await this.changePoss(game, 'nop')

        // First OT needs a little help
        if (game.otPoss === -2 && game.qtr === 5) {
          game.otPoss = 2
        }
      }
    }
  };

  async moveBall (game, mode = null, val = null) {
    if (mode === 'clear') {
      // this.ball.classList.toggle('hidden', true)
    } else if (mode === 'show') {
      this.ball.classList.toggle('hidden', false)
      this.ball.classList.toggle('fade', false)
    } else {
      if (mode !== 'kick') {
        await alertBox(this, 'The ball is hiked...')
      }
      this.ball.classList.toggle('hidden', false)
      await setBallSpot(this)
      if (mode === 'show/clear') {
        await this.moveBall(game, 'clear')
      }
    }
  }

  async kickoff (game) {
    // Set some things
    game.down = 0
    game.firstDown = 0

    await this.prePlay(game, game.status)

    if (game.status === SAFETY_KICK) {
      await this.punt(game) // Safety Kick

    // Regular old kickoff
    } else {
      // Reset board
      this.playerContainer.classList.toggle('fade', true)
      game.spot = 65
      await this.moveBall(game, 'show')

      await this.kickPage(game)

      if (game.status !== EXIT) {
        await this.returnPage(game)
      }
      if (game.status !== EXIT) {
        await this.kickDec(game)
      }
      if (game.status <= KICK) { // Kicks are negative
        game.status = Math.abs(game.status) // Make status positive (no more kicking)
        if (game.status === 1) game.status = 4 // INIT_KICK_DONE
      }
    }
  };

  async changePoss (game, mode = '') {
    // Modes explained
    // '' = just change poss
    // 'k' = kick (like a kickoff)
    // 'nop' = no ot poss, just change (but in OT)
    // 'ot' = set up OT
    // 'to' = turnover
    // 'pnt' = punt
    // 'fg' = missed field goal

    if (mode !== '' && mode !== 'k' && mode !== 'nop') {
      // moveBall(game, 'c');  // Which cleared the ball
    }

    if (mode !== 'nop' && mode !== 'ot' && game.isOT() && !game.twoPtConv && game.otPoss > 0) {
      game.otPoss = -game.otPoss // This indicates that the ot poss just ended, handle appropriately
    }

    if (mode === 'to') {
      game.spot = 100 - game.spot // Switch side of field
      // addRecap(game, teamName + ' turnover!') // or however
      // game.players[game.offNum].stats.tos++;  // Inc turnovers in Stats
      game.turnover = true
      game.down = 0
    } else if (mode === 'ot') {
      // Probably need a visual reset here
      game.spot = 75
      game.down = 0
      game.otPoss = Math.abs(game.otPoss) - 1
    } else if (mode === 'pnt') {
      game.spot = 100 - game.spot // Switch side of field
      game.down = 0
    } else if (mode === 'fg') {
      if (!game.isOT()) {
        if ((100 - game.spot) + 7 <= 20) { // By an obscure NFL rule, essentially a touchback
          game.spot = 20
        } else { // Take over at spot of kick
          game.spot = 100 - game.spot + 7
        }
        game.down = 0
      }
    } else if (mode === 'nop') {
      game.down = 0
    }

    if (mode !== '' && mode !== 'k' && mode !== 'nop') {
      this.moveBall('show') // Which showed ball
    }

    // This should never happen, but it's making sure the possessions don't equal each other
    // We assume to offensive number is correct
    if (game.offNum === game.defNum) {
      game.defNum = game.opp(game.offNum)
    }

    // Actually change possession and show it
    const tmp = game.offNum
    game.offNum = game.defNum
    game.defNum = tmp
    this.printPoss(game, this.scoreboardContainer)

    if (game.status >= REG && game.status <= 17 && game.status !== 16) {
      if (mode !== 'ot') {
        // printFirst(game);  // These are the first down markers
      }
      game.firstDown = game.spot + 10 // CHECK: I think this is needed
      await this.updateDown(game, mode === 'ot' ? -1 : 0)
    }
  };

  setLastPlay (game) {
    game.lastPlay = game.players[game.away].currentPlay + ' v ' + game.players[game.home].currentPlay + '  |  ' + (game.thisPlay.dist === 0 ? 'No gain' : (Math.abs(game.thisPlay.dist) + '-yard ' + (game.thisPlay.dist < 0 ? 'loss' : 'gain')))
  }

  async playSelection (game, p, type, msg) {
    const selection = null

    // Handle timeouts being called
    if (game.players[p].currentPlay === 'TO') {
      await this.timeout(game, p)
    }

    if (selection) {
      game.players[p].currentPlay = selection
    }

    // }

    animationSimple(this.scoreboardContainerTopLeft, 'collapsed')
    animationSimple(this.scoreboardContainerTopRight, 'collapsed')
  }

  async kickPage (game) {
    const oName = game.players[game.offNum].team.name
    //   let downEl = null

    //   if (game.offNum === game.away) {
    //     downEl = this.scoreboardContainerBotLeft
    //   } else {
    //     downEl = this.scoreboardContainerBotRight
    //   }

    //   downEl.innerText = 'Kickoff'
    //   animationSimple(this.scoreboardContainerBotLeft, 'collapsed', false)
    //   animationSimple(this.scoreboardContainerBotRight, 'collapsed', false)

    //   await this.playSelection(game, game.offNum, 'kick', oName + ' pick kickoff type...')
    // Handle computer timeouts, special plays
    while (game.status !== EXIT && !game.players[game.offNum].currentPlay) {
      let selection = null
      if (game.isComputer(game.offNum)) {
        if (game.changeTime === CHANGE) {
          await this.cpuTime(game, game.offNum)
        }
        await this.cpuPlay(game, game.offNum)
      }

      // Get play
      selection = await this.input.getInput(game, game.offNum, 'kick', oName + ' pick kickoff type...')

      // Handle timeouts being called
      if (game.players[game.offNum].currentPlay === 'TO' || selection === 'TO') {
        await this.timeout(game, game.offNum)
        selection = 'TO'
      }

      if (selection && selection !== 'TO') {
        game.players[game.offNum].currentPlay = selection
      }
    }
  }

  async returnPage (game) {
    const dName = game.players[game.defNum].team.name

    // await this.playSelection(game, game.defNum, 'ret', dName + ' pick return type...')

    while (game.status !== EXIT && !game.players[game.defNum].currentPlay) {
      let selection = null
      if (game.isComputer(game.defNum)) {
        if (game.changeTime === CHANGE) {
          await this.cpuTime(game, game.defNum)
        }
        await this.cpuPlay(game, game.defNum)
      }

      // Get play
      selection = await this.input.getInput(game, game.defNum, 'ret', dName + ' pick return type...')

      // Handle timeouts being called
      if (game.players[game.defNum].currentPlay === 'TO' || selection === 'TO') {
        await this.timeout(game, game.defNum)
        selection = 'TO'
      }

      if (selection && selection !== 'TO') {
        game.players[game.defNum].currentPlay = selection
      }
    }
  }

  async kickDec (game) {
    const oName = game.players[game.offNum].team.name
    const dName = game.players[game.defNum].team.name
    const kickType = game.players[game.offNum].currentPlay
    const retType = game.players[game.defNum].currentPlay
    let touchback = false
    let possession = true
    let tmp = null
    let kickDist = 0
    let multCard = null
    let yard = null
    let multiplier = 0 // Recently changed from -1
    let retDist = 0
    let okResult = false

    await alertBox(this, 'Teams are lining up for the kick...')
    if (game.animation) {
      animationSimple(this.qualityContainer, 'fade')
      animationSimple(this.scoreboardContainerTopLeft, 'collapsed')
      animationSimple(this.scoreboardContainerTopRight, 'collapsed')
      animationSimple(this.scoreboardContainerBotLeft, 'collapsed')
      animationSimple(this.scoreboardContainerBotRight, 'collapsed')
      await animationWaitForCompletion(this.fieldContainer, 'slide-away')

      this.plCard1.querySelector('.back').innerText = game.players[game.offNum].currentPlay
      if (game.offNum === game.home) {
        this.plCard1.querySelector('.back').classList.add('back-home')
      }
      await animationWaitForCompletion(this.plCard1, 'picked')

      this.plCard2.querySelector('.back').innerText = game.players[game.defNum].currentPlay
      if (game.defNum === game.home) {
        this.plCard2.querySelector('.back').classList.add('back-home')
      }
      await animationWaitForCompletion(this.plCard2, 'picked')

      await setBallSpot(this)
      await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    }

    if (kickType === 'RK') {
      if (retType === 'RR') {
        tmp = await Utils.rollDie(game, game.me)
        kickDist = 5 * tmp - 65
        multCard = await game.decMults(game.me)
        yard = await game.decYards(game.me)

        if (multCard.card === 'King') {
          multiplier = 10
        } else if (multCard.card === 'Queen') {
          multiplier = 5
        } else if (multCard.card === 'Jack') {
          multiplier = 1 // Recently changed from 0
        }

        retDist = multiplier * yard

      // Touchback
      } else {
        touchback = true
      }
    } else if (kickType === 'OK') {
      await alertBox(this, oName + ' onside kick!!!')
      let odds = 6
      if (retType === 'RK') {
        odds = 12
      }

      tmp = await Utils.randInt(1, odds, game, game.me)
      okResult = tmp === 1 // 1 in 'odds' odds of getting OK
      kickDist = -10 - tmp
      retDist = tmp + await Utils.rollDie(game, game.me)

      // Squib Kick
    } else {
      tmp = await Utils.rollDie(game, game.me)
      kickDist = -15 - 5 * tmp
      if (retType === 'RR') {
        retDist = await Utils.rollDie(game, game.me) + await Utils.rollDie(game, game.me)
      } else {
        retDist = 0
      }
    }

    await alertBox(this, 'The kick is up...')

    if (touchback) {
      await alertBox(this, 'Deep kick!')
      await this.moveBall(game, 'clear')
    } else {
      await alertBox(this, oName + ' kick...')
      game.thisPlay.dist = kickDist
      game.spot += kickDist
    }

    // if (kickType === 'OK') {
    //   if (okResult) {
    //     await alertBox(this, oName + ' recover!')
    //     possession = false
    //     retDist = -retDist
    //   } else {
    //     await alertBox(this, dName + ' recover!')
    //   }
    // }

    if (possession) {
      await this.changePoss(game, 'k')
    }

    let msg = ''
    if (!touchback) {
      await this.moveBall(game, 'kick')
      await alertBox(this, Math.abs(kickDist) + '-yard kick')

      if (kickType === 'OK') {
        if (okResult) {
          await alertBox(this, oName + ' recover!')
          possession = false
          retDist = -retDist
        } else {
          await alertBox(this, dName + ' recover!')
        }
      }

      if (game.animation) {
        const qualityArray = [10, 5, 1, 0] // Kickoff

        this.timesFooter.querySelector('.times-king').innerText = qualityArray[0] + 'X'
        this.timesFooter.querySelector('.times-queen').innerText = qualityArray[1] + 'X'
        this.timesFooter.querySelector('.times-jack').innerText = qualityArray[2] + 'X'
        this.timesFooter.querySelector('.times-10').innerText = qualityArray[3] + 'X'

        await animationWaitForCompletion(this.fieldContainer, 'slide-away')

        // this.multCard.querySelector('.back').innerText = multCard?.card || '/'
        // await animationWaitForComp + 'X'etion(this.multCard, 'picked')
        // // this.timesContainer.querySelector('.back').innerText = multiplier + 'X'
        // // await animationWaitForCompletion(this.timesContainer, 'picked')
        // this.yardCard.querySelector('.back').innerText = yard
        // await animationWaitForCompletion(this.yardCard, 'picked')

        this.multCard.querySelector('.back').innerText = multCard?.card || '/'
        if (multCard && multCard !== '/') {
          this.multCard.querySelector('.back').classList.add('times-' + multCard.card.toLowerCase())
        }
        await animationWaitForCompletion(this.multCard, 'picked')
        if (multCard && multCard !== '/') {
          this.timesFooter.querySelector('.times-' + multCard.card.toLowerCase()).classList.add('active')
          await sleep(500)
        }

        // this.timesContainer.querySelector('.back').innerText = (times || game.thisPlay.multiplier) + 'X'
        // await animationWaitForCompletion(this.timesContainer, 'picked')

        this.yardCard.querySelector('.back').innerText = yard || retDist
        if (game.offNum === game.home) {
          this.plCard1.querySelector('.back').classList.add('back-home')
        }
        await animationWaitForCompletion(this.yardCard, 'picked')
      }

      if (retDist === 0) {
        msg += 'No return'
      } else {
        tmp = game.spot // Nec?

        if (possession) {
          msg += dName + ' return... '
        } else {
          msg += oName + ' return... '
        }

        if (game.spot + retDist >= 100) {
          game.status = 101
          // addRecap( kick return TD )
          retDist = 100 - game.spot
        } else if (game.spot + retDist <= 0) {
          game.status = 102
          retDist = -game.spot
        }

        game.thisPlay.dist = retDist
        await this.moveBall(game, 'kick')
        game.spot += retDist
        msg += (retDist > 0 ? '+' : '-') + Math.abs(retDist) + '-yard return!'
      }
    } else {
      msg += 'Touchback...'
      game.spot = 25
      await this.moveBall('show')
      // Return Timeout
      if (game.changeTime === TIMEOUT) {
        await this.returnTime(game)
      }
      if (game.twoMinWarning) {
        game.twoMinWarning = false
      }
      game.changeTime = TB
    }

    if (this.fieldContainer.classList.contains('slide-away')) {
      await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    }

    await setBallSpot(this)
    await alertBox(this, msg)
  };

  async playMechanism (game) {
    await this.prePlay(game, REG)
    await this.pickPlay(game)

    if (game.status !== EXIT) {
      await this.lineUp(game)
      await sleep(750)
      await this.lastChanceTO(game)
      if (game.animation) {
        await animationWaitForCompletion(this.fieldContainer, 'slide-away')
      }
      await this.doPlay(game, game.players[1].currentPlay, game.players[2].currentPlay)
    }
  };

  async lastChanceTO (game) {
    let selection

    // Very end of the game
    if (game.status < 900 && ((game.qtr === 2 || game.qtr === 4) && game.currentTime === 0) && !game.changeTime) {
      for (let p = 1; p <= 2; p++) {
        // Real and have a timeout, one's not been called
        if (!game.isComputer(p) && game.players[p].timeouts && !game.changeTime) {
          console.log('p: ' + p + ' changeTime: ' + game.changeTime)
          if (game.me === p) {
            alert('The ' + (game.qtr === 2 ? 'half' : 'game') + ' is about to end! Last chance for the ' + game.players[p].team.name + ' to call a timeout!')
          }

          selection = await this.input.getInput(game, p, 'last', game.players[p].team.name + ' call a timeout?')

          if (selection === 'Y') {
            const storePlay = game.players[p].currentPlay
            await this.timeout(game, p)
            game.players[p].currentPlay = storePlay
          }
        }
      }
    }
  };

  async prePlay (game, stat) {
    if (game.isMultiplayer()) {
      if (game.connection.host) {
        await this.receiveInputFromRemote()
      } else {
        await this.sendInputToRemote('Pre-play check-in. Last play: ' + game.lastPlay)
      }
      // await this.sendInputToRemote('check-in: ' + (this.transmissions.length + (game.connection.host ? 0 : 1)))
      // await this.receiveInputFromRemote()
    }

    // Autosave
    if (game.resume) game.resume = false
    if (!game.isMultiplayer()) {
      window.localStorage.setItem('savedGame', LZString.compressToUTF16(JSON.stringify(game)))
    }

    game.thisPlay.multiplierCard = null
    game.thisPlay.yardCard = null
    game.thisPlay.multiplier = null
    game.thisPlay.quality = null
    game.thisPlay.dist = null
    game.thisPlay.bonus = 0
    game.players[1].currentPlay = null
    game.players[2].currentPlay = null

    await firstDownLine(this)

    if (game.twoPtConv) {
      const twoPtText = 'Two-point conversion'
      if (game.offNum === game.away) {
        this.scoreboardContainerBotLeft.innerText = twoPtText
      } else {
        this.scoreboardContainerBotRight.innerText = twoPtText
      }
    }

    if (game.status > KICK) {
      animationSimple(this.scoreboardContainerBotLeft, 'collapsed', false)
      animationSimple(this.scoreboardContainerBotRight, 'collapsed', false)

      await this.setHuddle(game)
      // RIGHT HERE
      // ASSIGN PLAYERS THEIR COLORS
      // REVEAL (ONLY FOR NON KICKS)
      // LATER, SHOULD BE HUDDLE RIGHT NOW
    }

    resetBoardContainer(this)

    if (!game.twoPtConv || (game.twoPtConv && (game.changeTime === PEN_DOWN || game.changeTime === PEN_NO_DOWN))) { // } && game.changeTime === TIMEOUT) {
      game.changeTime = CHANGE
    }

    if (game.turnover && game.down !== 1) {
      game.down = 1
    }

    game.turnover = false

    game.status = stat

    if ((game.qtr === 2 || game.qtr === 4) && game.currentTime === 2) {
      await this.twoMinCheck(game)
    }
  };

  async setHuddle (game) {
    this.playerContainer.classList.toggle('fade', true)

    this.defHelms.forEach(helmet => {
      helmet.classList.remove('home-helm')
      helmet.classList.remove('away-helm')
      helmet.classList.add('huddle')

      if (game.defNum === game.home) {
        helmet.classList.add('home-helm')
      } else {
        helmet.classList.add('away-helm')
      }
    })

    this.offHelms.forEach(helmet => {
      helmet.classList.remove('home-helm')
      helmet.classList.remove('away-helm')
      helmet.classList.add('huddle')

      if (game.offNum === game.home) {
        helmet.classList.add('home-helm')
      } else {
        helmet.classList.add('away-helm')
      }
    })

    await animationWaitForCompletion(this.playerContainer, 'fade', false)
  };

  async lineUp (game) {
    if (!this.playerContainer.classList.contains('fade')) {
      await animationWaitForCompletion(this.playerContainer, 'fade', true)
    }

    // this.playerContainer.classList.toggle('fade', true)

    this.defHelms.forEach(helmet => {
      helmet.classList.remove('huddle')
    })

    this.offHelms.forEach(helmet => {
      helmet.classList.remove('huddle')
    })

    this.playerContainer.classList.toggle('fade', false)
  };

  async twoMinCheck (game) {
    let twoMin = game.twoMinWarning
    let timChg

    // Two-minute warning just ended
    if (twoMin) {
      timChg = 0
      twoMin = false

      // Two-minute warning needs to start
    } else {
      timChg = 9
      twoMin = true
      await alertBox(this, 'Two-minute warning...')
    }

    game.changeTime = timChg
    game.twoMinWarning = twoMin
  };

  async pickPlay (game) {
    const start = game.offNum
    const change = start === 1 ? 1 : -1

    for (let p = start; p === 1 || p === 2; p += change) {
      let selection = null
      game.players[p].currentPlay = null

      // Handle computer timeouts, special plays
      while (game.status !== EXIT && !game.players[p].currentPlay) {
        if (game.isComputer(p)) {
          if (game.changeTime === CHANGE) {
            await this.cpuTime(game, p)
          }
          await this.cpuPlay(game, p)
        }

        // Get play
        selection = await this.input.getInput(game, p, 'reg', game.players[p].team.name + ' pick your play...')

        // Handle timeouts being called
        if (selection === 'TO' || game.players[p].currentPlay === 'TO') {
          await this.timeout(game, p)
          selection = 'TO'
        }

        if (selection && selection !== 'TO') {
          game.players[p].currentPlay = selection
        }
      }

      // Computer Stuff
      // if (game.status !== EXIT && p === 2 && !game.isComputer(2)) {
      //   // This is where the computer can call timeout or pick special play
      //   await alertBox(this, game.players[2].team.name + ' are picking their play...')
      //   document.querySelector('.' + (game.away === game.offNum ? 'away-msg' : 'home-msg') + '.top-msg').innerText = game.players[2].team.name + ' are picking their play...'
      //   if (game.changeTime === 0) {
      //     await this.cpuTime(game)
      //   }

      //   await this.cpuPlay(game)
      // }

      // await this.playSelection(game, p, 'reg', game.players[p].team.name + ' pick your play...')
    }

    // Making sure you didn't exit
    if (game.status !== EXIT) {
      game.status = this.setStatus(game, game.players[1].currentPlay, game.players[2].currentPlay)

      await alertBox(this, 'Both teams are lining up for the snap...')

    // Exit out of the game
    } else {
      await alertBox(this, 'Catch ya laterrrrr!')
      // LATER: Save game somewhere
    }
  };

  boardAnimate (option) {
    const board = document.querySelector('.board-container')
    board.addEventListener('transitionend', () => {
      if (option === 'in') {
        board.style.display = ''
      } else {
        board.style.display = 'none'
      }
    }, { once: true })
    if (board.classList.contains('slide-away')) {
      board.classList.remove('slide-away')
    } else {
      board.classList.add('slide-away')
    }
  }

  async slideBoard (option = 'uncollapse', el = document.querySelector('.scoreboard-container')) {
    // return new Promise(resolve => {
    //   const onTransitionEnd = () => {
    //     el.removeEventListener('transitionend', onTransitionEnd)
    //     resolve()
    //   }
    //   el.addEventListener('transitionend', onTransitionEnd)

    //   if (option === 'uncollapse') {
    //     if (el.classList.contains('collapsed')) {
    //       el.classList.remove('collapsed')
    //       // resolve()
    //     } else {
    //       resolve()
    //     }
    //   } else {
    //     el.classList.add('collapsed')
    //     // resolve()
    //   }
    // })

    await animationWaitForCompletion(el, 'collapsed')
  }

  async cpuTime (game, p) {
    const toCount = game.players[p].timeouts
    const ono = game.offNum

    if (toCount > 0) {
      const qtr = game.qtr
      const ctim = game.currentTime
      const spt = game.spot
      const notPScore = game.players[game.opp(p)].score
      const pScore = game.players[p].score
      let endHalf = false
      let lastMin = false
      let ballBack = false
      let kick = false

      // End half and losing
      endHalf = ((qtr === 2 || qtr === 4) && pScore <= notPScore && ctim <= 1 && game.down !== 4)

      // Last minute with favorable spot
      if (!endHalf) {
        lastMin = (((ono === 1 && spt < 50) || (ono === p && spt >= 50)) && qtr === 2 && ctim <= 1)
      }
      // Chance to get the ball back
      if (!endHalf && !lastMin) {
        ballBack = ((qtr === 2 || qtr === 4) && ctim === 0 && ono === 1 && game.players[1].timeouts === 0 && game.down === 4)
      }
      // Timeout on kickoff
      if (!endHalf && !lastMin && !ballBack) {
        kick = (qtr === 4 && ctim <= 0.5 && game.status === -3 && pScore < notPScore)
      }
      if (endHalf || lastMin || ballBack || kick) {
        await this.timeout(game, p)
        // print_timeout()
      }
    }
  };

  async timeout (game, p) {
    const tChg = game.changeTime
    const toCount = game.players[p].timeouts
    let msg = ''

    // 9 = Two-min call
    if (tChg === 9) {
      msg = 'Timeout not called, two minute warning...'
    } else if (game.twoPtConv) {
      msg = 'Timeout not called, two-point conversion...'
      // 4 = Timeout called
    } else if (tChg !== 4) {
      // Call timeout
      if (toCount > 0) {
        const to = game.callTime(p)
        game.lastCallTO = p
        game.changeTime = TIMEOUT
        msg = 'Timeout called by ' + game.players[p].team.name
        document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + to).classList.add('called')
        // Disable button mid-play
        // this.input.disableTimeout(p);
        // LATER: Print timeout change
        // No timeouts left
      } else {
        msg = 'Timeout not called, no timeouts...'
      }
    } else {
      msg = "Timeout not called, one's been called..."
    }

    await alertBox(this, msg)
    game.players[p].currentPlay = null
  };

  async cpuPlay (game, p) {
    if (game.offNum === p) {
      const qtr = game.qtr
      const curtim = game.currentTime
      const toCount = game.players[p].timeouts
      const tchg = game.changeTime
      const qlen = game.qtrLength
      const spt = game.spot
      const hm = game.players[p].hm
      const dwn = game.down
      const fdn = game.firstDown
      const diff = game.players[game.opp(p)].score - game.players[p].score
      let scoreBlock = 0
      let timeBlock = 0
      let dec = null

      // Time block
      if (curtim === 0 && (qtr === 2 || qtr === 4) && toCount === 0 && tchg !== 4) {
        timeBlock = 1 // Last play
      } else if (curtim <= 0.5 && qtr === 4) {
        timeBlock = 2 // Late game
      } else if ((qlen <= 2 && (qtr >= 3 && qtr <= 4)) || (curtim <= 4 && qtr === 4)) {
        timeBlock = 3 // Some left
      } else if ((qlen <= 4 && (qtr >= 3 && qtr <= 4)) || (curtim <= 8 && qtr === 4)) {
        timeBlock = 4 // Lots left
      }

      // Score Block
      if (diff >= 1) {
        if (diff <= 3) {
          scoreBlock = 1 // Down a FG
        } else if (diff <= 8) {
          scoreBlock = 2 // Down a possession
        } else if (diff <= REG) {
          scoreBlock = 3 // Down a poss + FG
        } else {
          scoreBlock = 4 // Down 2+ TDs
        }
      }

      // Put it all together
      // Half over, kick a FG
      if (spt >= 60 && ((timeBlock === 1 && qtr === 2) || (scoreBlock === 0 && timeBlock === 1 && qtr === 4))) {
        dec = 'FG'
      }

      // Hail mary
      if (!dec && hm && ((timeBlock === 1 && scoreBlock > 1) || (timeBlock === 2 && scoreBlock === 1 && spt < 70) || (timeBlock === 2 && scoreBlock > 1))) {
        dec = 'HM'
      }

      // Gotta go for it
      if (!dec && timeBlock === 1 && scoreBlock === 1) {
        if (spt >= 60) {
          dec = 'FG' // To win or tie
        } else if (hm) {
          dec = 'HM'
        }
      }

      // OT go for it
      if (!dec && qtr > 4 && scoreBlock === 2 && dwn === 4) {
        if (hm && fdn - spt > 10) {
          dec = 'HM'
        } else {
          dec = 'GO' // Cuz there are no punts
        }
      }

      // 4th down, dire
      if (!dec && dwn === 4 && (((timeBlock >= 1 && timeBlock <= 2) && scoreBlock === 1) || (timeBlock >= 3 && scoreBlock === 3))) {
        if (spt >= 60) {
          dec = 'FG'
        } else {
          if (hm && fdn - spt > 10) {
            dec = 'HM'
          } else {
            dec = 'GO'
          }
        }
      }

      // 4th down, go
      if (!dec && dwn === 4 && ((timeBlock === 3 && (scoreBlock >= 1 && scoreBlock <= 4)) || (timeBlock === 4 && scoreBlock === 4))) {
        if (hm && fdn - spt > 10) {
          dec = 'HM'
        } else {
          dec = 'GO'
        }
      }

      // 4th down, regular choices
      if (!dec && dwn === 4) {
        if ((spt >= 98 || (spt >= 50 && spt <= 70)) && fdn - spt <= 3 && await Utils.coinFlip()) {
          dec = 'GO'
        }

        // Not going for it, so...
        if (!dec) {
          if (spt >= 60) {
            dec = 'FG'
          } else {
            dec = 'PT'
          }
        }
      }

      // Set the play
      if (!(!dec || dec === 'GO' || game.twoPtConv)) {
        game.players[p].currentPlay = dec
      }
    }
  };

  async cpuPages (game, p, state = 'reg') {
    if (!game.players[p].currentPlay) {
      if (state === 'reg') {
        let total = 0
        let playNum = -1
        let playAbrv = ''

        while (total === 0) {
          playNum = await Utils.randInt(0, 4)

          // Make it harder to pick Trick Play
          if (playNum === 4) {
            playNum = await Utils.randInt(0, 4)
          }

          // Translate to abrv
          playAbrv = 'SRLRSPLPTP'.substring(2 * playNum, 2 * playNum + 2)
          total = game.players[p].plays[playAbrv].count
        }

        // game.players[p].currentPlay = playAbrv
        return playAbrv
      } else if (state === 'pat') {
        await alertBox(this, game.players[p].team.name + ' selecting PAT type...')
        let selection = 'XP'

        const diff = game.players[game.opp(p)].score - game.players[p].score

        if (diff === -5 || diff === -1 || diff === 2 || diff === 5 || diff === 9 || diff === 10 || diff === 13 || diff === 17 || diff === 18) {
          selection = '2P'
        }

        // game.players[p].currentPlay = selection
        return selection
      } else if (state === 'kick') {
        await alertBox(this, game.players[p].team.name + ' selecting kickoff type...')
        await this.cpuTime(game, p)

        const qtr = game.qtr
        const ctim = game.currentTime
        const pScore = game.players[p].score
        const notPScore = game.players[game.opp(p)].score
        let kckDec = 'RK'

        if ((qtr === 4 && ctim <= 3 && pScore < notPScore) || (((qtr === 3 && ctim <= 7) || qtr === 4) && notPScore - pScore > 8)) {
          kckDec = 'OK'
        } else if ((qtr === 2 || qtr === 4) && ctim <= 1 && pScore > notPScore) {
          kckDec = 'SK'
        }

        // game.players[p].currentPlay = kckDec
        return kckDec
      } else if (state === 'ret') {
        await alertBox(this, game.players[p].team.name + ' selecting return type...')
        await this.cpuTime(game, p)

        const qtr = game.qtr
        const ctim = game.currentTime
        const pScore = game.players[p].score
        const notPScore = game.players[game.opp(p)].score
        let retDec = 'RR'

        // Very late game and P1 losing -OR- later game and P1 losing badly
        if ((qtr === 4 && ctim <= 3 && notPScore < pScore) || (((qtr === 3 && ctim <= 7) || qtr === 4) && pScore - notPScore > 8)) {
          retDec = 'OR'
        } else if (Utils.coinFlip()) {
          retDec = 'TB'
        }

        // game.players[p].currentPlay = retDec
        return retDec
      } else if (state === 'coin') {
        return await Utils.coinFlip(game, game.me) ? 'H' : 'T'
      } else if (state === 'kickDecOT' || state === 'kickDecReg') {
        let decPick
        decPick = await Utils.randInt(1, 2)
        if (game.qtr < 4) {
          decPick = decPick === 1 ? 'K' : 'R'
        } // else: Leave it as 1 or 2 for OT possession picking
        return decPick
      }
    } else {
      return game.players[p].currentPlay
    }
  };

  async playPages (game, p, state = 'reg', pick = null) {
    let selection = null

    await animationPrePick(this, game, p)
    selection = await this.input.getInput(game, p, state)
    await animationPostPick(this, game, p)

    // LATER: Send user selection to server
    // this.channel.trigger('client-picked-play', { selection })

    game.players[p].currentPlay = selection
  };

  // Determine if passed play is valid for this play
  playLegal (p, passedType, abrv, thisType) {
    let legal = false
    if (passedType !== 'reg' && passedType === thisType) {
      legal = true
    } else if (passedType === 'reg' && thisType === 'reg') {
      const playIndex = 'SR,LR,SP,LP,TP,HM,FG,PT'.indexOf(abrv) / 3
      let totalPlays = 0
      legal = true // Assume that the pick is valid

      // Get total plays left
      if (abrv === 'FG' || abrv === 'PT') {
        totalPlays = -1
      } else if (abrv === 'HM') {
        totalPlays = this.game.players[p].hm
      } else if (playIndex !== -1) {
        totalPlays = this.game.players[p].plays[abrv].count
      }

      // Out of plays
      if (playIndex >= 0 && playIndex <= 5) {
        if (totalPlays === 0) {
          legal = false
        }
      }

      // Illegal play choice
      if (legal && playIndex === -1) {
        legal = false
      }

      // HM or kick on defense
      if (legal && playIndex >= 5 && playIndex <= 7 && this.game.defNum === p) {
        legal = false
      }

      // Super long FG
      if (legal && abrv === 'FG' && this.game.spot < 45) {
        legal = false
      }

      // Punt on not fourth
      if (legal && abrv === 'PT' && this.game.down !== 4) {
        legal = false
      }

      // Punt in OT
      if (legal && abrv === 'PT' && this.game.isOT()) {
        legal = false
      }

      // Kick on two-point conversion
      if (legal && totalPlays === -1 && this.game.twoPtConv) {
        legal = false
      }
    }

    return legal
  }

  topMessageDown (aTop, hTop) {
    aTop.classList.toggle('top-up', false)
    hTop.classList.toggle('top-up', false)
    aTop.classList.toggle('top-down', true)
    hTop.classList.toggle('top-down', true)
  }

  botMessageDown (aBot, hBot) {
    aBot.classList.toggle('bot-up', false)
    hBot.classList.toggle('bot-up', false)
    aBot.classList.toggle('bot-down', true)
    hBot.classList.toggle('bot-down', true)
  }

  botMessageUp (aBot, hBot) {
    aBot.classList.toggle('bot-up', false)
    hBot.classList.toggle('bot-up', false)
    aBot.classList.toggle('bot-down', true)
    hBot.classList.toggle('bot-down', true)
  }

  topMessageUp (aTop, hTop) {
    aTop.classList.toggle('top-down', false)
    hTop.classList.toggle('top-down', false)
    aTop.classList.toggle('top-up', true)
    hTop.classList.toggle('top-up', true)
  }

  printPoss (game, scoreboard) {
    // const awayTeam = scoreboard.querySelector('.away.team')
    // const homeTeam = scoreboard.querySelector('.home.team')

    // if (game.away === game.offNum) {
    //   homeTeam.classList.toggle('poss', false)
    //   awayTeam.classList.toggle('poss', true)
    // } else {
    //   awayTeam.classList.toggle('poss', false)
    //   homeTeam.classList.toggle('poss', true)
    // }
    const clockPoss = scoreboard.querySelector('.clock-poss')

    // Turn off fade
    clockPoss.classList.toggle('fade', false)

    if (game.away === game.offNum) {
      clockPoss.classList.toggle('poss-home', false)
    } else {
      clockPoss.classList.toggle('poss-home', true)
    }
  }

  printName (game, scoreboard) {
    const awayTeam = scoreboard.querySelector('.away.team')
    const homeTeam = scoreboard.querySelector('.home.team')

    homeTeam.innerText = game.players[game.home].team.abrv
    awayTeam.innerText = game.players[game.away].team.abrv
  }

  printScore (game, scoreboard) {
    const awayScore = scoreboard.querySelector('.away.score')
    const homeScore = scoreboard.querySelector('.home.score')

    homeScore.innerText = game.players[game.home].score
    awayScore.innerText = game.players[game.away].score
  }

  printClock (game, scoreboard) {
    const clockTime = scoreboard.querySelector('.clock .time')
    if (game.qtr < 5) {
      clockTime.innerText = this.printTime(game.currentTime)
    }
  }

  printMsgDown (game, scoreboard) {
    const blMsg = scoreboard.querySelector('.away-msg.bot-msg')
    const brMsg = scoreboard.querySelector('.home-msg.bot-msg')
    if (game.away === game.offNum) {
      blMsg.innerText = game.down + this.ending(game.down) + ' & ' + this.downDist(game.firstDown, game.spot)
    } else {
      brMsg.innerText = game.down + this.ending(game.down) + ' & ' + this.downDist(game.firstDown, game.spot)
    }
  }

  printMsgSpot (game, scoreboard) {
    const blMsg = scoreboard.querySelector('.away-msg.bot-msg')
    const brMsg = scoreboard.querySelector('.home-msg.bot-msg')
    if (game.away === game.offNum) {
      brMsg.innerText = this.printSpot(game, game.spot)
    } else {
      blMsg.innerText = this.printSpot(game, game.spot)
    }
  }

  printQuarter (game, scoreboard) {
    const clockQtr = scoreboard.querySelector('.clock .qtr')
    clockQtr.innerText = this.showQuarter(game.qtr)
  }

  showBoard (game, scoreboard) {
    this.printPoss(game, scoreboard)
    this.printName(game, scoreboard)
    this.printScore(game, scoreboard)
    this.printClock(game, scoreboard)
    this.printMsgDown(game, scoreboard)
    this.printMsgSpot(game, scoreboard)
    this.printQuarter(game, scoreboard)
  }

  showQuarter (qtr) {
    if (qtr > 4) {
      qtr = qtr - 4

      if (qtr === 1) {
        qtr = 'OT'
      } else {
        qtr = qtr + 'OT'
      }
    } else {
      qtr = qtr + this.ending(qtr)
    }

    return qtr
  }

  ending (num) {
    let ending = 'th'

    if (num === 1) {
      ending = 'st'
    } else if (num === 2) {
      ending = 'nd'
    } else if (num === 3) {
      ending = 'rd'
    }

    return ending
  };

  downDist (f, s) {
    let ending = f - s

    if (f === 100) {
      ending = 'G'
    } else if (f === s) {
      ending = 'IN'
    }

    return ending
  };

  printTime (time) {
    if (time === -0.5) {
      return 'End'
    } else {
      const min = Math.trunc(time)
      let sec = Math.round((time - min) * 60)
      if (sec < 10) {
        sec = '0' + sec
      }

      return min + ':' + sec
    }
  };

  printSpot (game, s) {
    let spot = '50'

    if (s < 50) {
      spot = game.players[game.offNum].team.abrv + ' ' + s
    } else if (s > 50) {
      spot = game.players[game.defNum].team.abrv + ' ' + (100 - s)
    }

    return spot
  };

  setStatus (game, p1, p2) {
    let stat = null
    const ono = game.offNum

    if ('SRLRSPLP'.includes(p1) && 'SRLRSPLP'.includes(p2)) {
      stat = REG
    }

    if (!stat) {
      if (p1 === 'HM' || p2 === 'HM') {
        stat = HAIL
      } else if (p1 === 'FG' || p2 === 'FG') {
        stat = FG
      } else if (p1 === 'PT' || p2 === 'PT') {
        stat = PUNT
      }
    }

    if (!stat) {
      if (p1 === 'TP') {
        stat = ono === 1 ? OFF_TP : DEF_TP
      } else if (p2 === 'TP') {
        stat = ono === 1 ? DEF_TP : OFF_TP
      } else {
        stat = REG
      }
    }

    return stat
  };

  async doPlay (game, p1, p2) {
    if (game.status >= REG && game.status <= DEF_TP) {
      await this.regPlay(game, p1, p2)
    }

    if (game.status === SAME) {
      await this.samePlay(game)
    } else if (game.status === OFF_TP || game.status === DEF_TP) {
      await this.trickPlay(game)
    } else if (game.status === FG) {
      await this.fieldGoal(game)
    } else if (game.status === PUNT) {
      await this.punt(game)
    } else if (game.status === HAIL) {
      await this.hailMary(game)
    }
  };

  async regPlay (game, pl1, pl2) {
    let tmp = null
    this.drawPlay(game, 1, pl1)
    this.drawPlay(game, 2, pl2)

    // If both players picked the same play, 50/50 chance of Same Play Mechanism
    if (pl1 === pl2) {
      tmp = await Utils.coinFlip(game, game.me)

      if (pl1 === 'TP' || tmp) {
        game.status = SAME
      }
    }
  };

  drawPlay (game, plr, play) {
    game.players[plr].decPlays(play)
  };

  async samePlay (game) {
    let coin = null
    let multCard = null

    await alertBox(this, 'Same play!')

    coin = await Utils.coinFlip(game, game.me)

    multCard = await game.decMults(game.me)

    if (multCard.card === 'King') {
      await this.bigPlay(game, coin ? game.offNum : game.defNum)
    } else if (multCard.card === 'Queen' && coin) {
      game.thisPlay.multiplier = 3
    } else if (multCard.card === 'Jack' && !coin) {
      game.thisPlay.multiplier = -3
    } else if ((multCard.card === 'Queen' && !coin) || (multCard.card === 'Jack' && coin)) {
      game.thisPlay.multiplier = 0
    } else {
      if (coin) {
        await alertBox(this, 'Picked!')
        await this.changePoss(game, 'to')
      }
      game.thisPlay.dist = 0
      game.thisPlay.yardCard = '/'
    }
  };

  async returnTime (game) {
    game.players[game.lastCallTO].timeouts++
    document.querySelector('.' + (game.away === game.lastCallTO ? 'away' : 'home') + ' .to' + game.players[game.lastCallTO].timeouts).classList.remove('called')
    await alertBox(this, 'Timeout returned to ' + game.players[game.lastCallTO].team.name + '...')
  };

  async bigPlay (game, num) {
    let die = null
    die = await Utils.rollDie(game, game.me)

    // Offensive Big Play
    if (game.offNum === num) {
      if (die >= 1 && die <= 3) {
        game.thisPlay.dist = 25
      } else if (die === 6) {
        game.thisPlay.dist = 101 // Touchdown
      } else { // die === 4 && die === 5
        if ((100 - game.spot) / 2 > 40) { // Half the field or 40, whichever is more
          game.thisPlay.dist = Math.round((100 - game.spot) / 2)
        } else {
          game.thisPlay.dist = 40
        }
      }
      // Defense
    } else {
      if (die >= 1 && die <= 3) {
        // If timeout called, return
        if (game.changeTime === TIMEOUT) {
          await this.returnTime(game)
        }

        game.changeTime = PEN_DOWN

        if (game.spot - 10 < 1) {
          game.thisPlay.dist = -Math.trunc(game.spot / 2) // Half the distance to the goal
        } else {
          game.thisPlay.dist = -10 // 10-yard penalty on off
        }
      } else {
        if (die === 6) {
          await alertBox(this, 'FUMBLE!!!')
          game.thisPlay.dist = 101 // Touchdown
        } else { // die === 4 && die === 5
          await alertBox(this, 'FUMBLE!!')
          if ((100 - game.spot) / 2 > 25) { // Half the field or 25, whichever is more
            game.thisPlay.dist = Math.round((100 - game.spot) / 2)
          } else {
            game.thisPlay.dist = 25
          }
        }
        await this.changePoss(game, 'to')
      }
    }

    // Prevent calculations
    game.thisPlay.multiplierCard = '/'
    game.thisPlay.yardCard = '/'
    game.thisPlay.multiplier = '/'
  }

  async trickPlay (game) {
    let die = null
    die = await Utils.rollDie(game, game.me)

    await alertBox(this, (game.status === OFF_TP ? game.players[game.offNum].team.name : game.players[game.defNum].team.name) + ' trick play!')

    if (die === 2) {
      // If timeout called, return
      if (game.changeTime === TIMEOUT) {
        await this.returnTime(game)
      }
      game.changeTime = PEN_DOWN

      // Offense Trick Play
      if (game.status === 12) {
        if (game.spot + 15 > 99) {
          game.thisPlay.dist = Math.trunc((100 - game.spot) / 2) // Half the distance to the goal
        } else {
          game.thisPlay.dist = 15 // 15-yard penalty on def
        }
        // Defense
      } else {
        if (game.spot - 15 < 1) {
          game.thisPlay.dist = -Math.trunc(game.spot / 2) // Half the distance to the goal
        } else {
          game.thisPlay.dist = -15 // 15-yard penalty on off
        }
      }

      // Prevent calcuations
      game.thisPlay.multiplierCard = '/'
      game.thisPlay.yardCard = '/'
    } else if (die === 3) {
      game.thisPlay.multiplierCard = '/'
      game.thisPlay.multiplier = -3
    } else if (die === 4) {
      game.thisPlay.multiplierCard = '/'
      game.thisPlay.multiplier = 4
    } else if (die === 5) {
      await this.bigPlay(game, game.status === OFF_TP ? game.offNum : game.defNum)
      // die === 1 && die === 6
    } else {
      if (game.status === OFF_TP) {
        game.thisPlay.bonus = 5
      } else {
        game.thisPlay.bonus = -5
      }

      // Place play based on die roll
      game.players[(game.status === OFF_TP ? game.offNum : game.defNum)].currentPlay = die === 1 ? 'LP' : 'LR'
    }
  };

  async fieldGoal (game) {
    const name = game.players[game.offNum].team.name
    let make = true
    const spt = 100 - game.spot
    const fdst = spt + 17
    let die = null
    die = await Utils.rollDie(game, game.me)

    if (game.animation) await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    await alertBox(this, name + ' attempting a ' + fdst + '-yard field goal...')
    this.playerContainer.classList.toggle('fade', true)

    // Ice kicker
    if (game.changeTime === TIMEOUT && game.lastCallTO !== game.offNum) {
      die++
      await alertBox(this, 'Kicker iced!')
    }

    if (fdst > 65) {
      let tmp = null
      tmp = await Utils.randInt(1, 1000, game, game.me)
      make = tmp === fdst // 1 in 1000 chance you get fdst
    } else if ((fdst >= 60 && die < 6) || (fdst >= 50 && die < 5) || (fdst >= 40 && die < 4) || (fdst >= 30 && die < 3) || (fdst >= 20 && die < 2)) {
      make = false
    }

    await this.fgAnimation(game, fdst - 10, make)

    if (make) {
      await this.scoreChange(game, game.offNum, 3)
      if (game.isOT()) {
        // Maybe the graphics are different here
      } else {
        game.status = -3
      }
    } else {
      await alertBox(this, name + ' field goal is no good...')
      if (!game.isOT()) {
        await this.changePoss(game, 'fg')
      }
    }

    // LATER: addRecap()
    // addRecap(..., fdst + '-yd FG ' + (make ? 'good' : 'missed'));

    if (game.isOT()) {
      game.otPoss = -Math.abs(game.otPoss)
    }
  };

  async punt (game) {
    const oName = game.players[game.offNum].team.name
    const dName = game.players[game.defNum].team.name
    let block = false
    let touchback = false
    let possession = true
    let kickDist = 0
    let retDist = 0
    let tmp = null
    let downEl = null

    if (game.offNum === game.away) {
      downEl = this.scoreboardContainerBotLeft
    } else {
      downEl = this.scoreboardContainerBotRight
    }

    downEl.innerText = game.status === SAFETY_KICK ? 'Safety Kick' : 'Kickoff'
    animationSimple(this.scoreboardContainerBotLeft, 'collapsed', false)
    animationSimple(this.scoreboardContainerBotRight, 'collapsed', false)

    // Safety Kick
    if (game.status === SAFETY_KICK) {
      // Probably reset graphics
      game.spot = 35
      // await this.moveBall(game, 'show')
      await setBallSpot(this, 65)
      // Punt
    } else {
      // Add Recap for punt, maybe remove first down sticks
    }

    if (game.animation) await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    await alertBox(this, oName + (game.status === SAFETY_KICK ? ' safety kick' : ' are punting') + '...')
    this.playerContainer.classList.toggle('fade', true)
    // Check block (not on Safety Kick)
    tmp = await Utils.rollDie(game, game.me)

    if (game.status !== SAFETY_KICK && tmp === 6) {
      tmp = null
      tmp = await Utils.rollDie(game, game.me)
      if (tmp === 6) { // 1 in 36 chance, must roll TWO sixes in a row
        block = true
      }
    }

    // Get yard card
    if (!block) {
      // Yard card times 10 and, if heads, add 20
      tmp = await Utils.coinFlip(game, game.me)

      const yard = await game.decYards(game.me)

      kickDist = 10 * yard / 2 + 20 * tmp

      // Check for touchbacks
      if (game.spot + kickDist > 100) {
        touchback = true
      }
    }

    await alertBox(this, 'The punt is up...')

    if (touchback) {
      await alertBox(this, 'Deep kick!')
      await this.moveBall(game, 'clear')
    } else if (block) {
      await alertBox(this, dName + ' blocked the punt!!!')
      // addRecap( blocked punt )
      // Regular punt/safety kick
    } else {
      game.thisPlay.dist = kickDist
      await this.moveBall(game, 'kick')
    }

    game.spot += kickDist

    // Check muff, but not on safety kick
    tmp = null
    tmp = await Utils.rollDie(game, game.me)
    if (!touchback && !block && game.status !== SAFETY_KICK && tmp === 6) {
      tmp = null
      tmp = await Utils.rollDie(game, game.me)
      if (tmp === 6) {
        possession = false
      }
    }

    if (possession) {
      if (touchback) {
        await this.changePoss(game, 'k')
      } else {
        await this.changePoss(game, 'pnt')
      }
    } else {
      await alertBox(this, dName + ' muffed the kick! ' + oName + ' recover the ball...')
      // addRecap( muffed punt )
      // record turnover to defNum
    }

    // Return
    let msg = 'The return: '

    if (possession && !touchback && !block) {
      const multCard = await game.decMults(game.me)
      const yard = await game.decYards(game.me)
      let mult = -0.5

      if (multCard.card === 'King') {
        mult = 7
      } else if (multCard.card === 'Queen') {
        mult = 4
      } else if (multCard.card === 'Jack') {
        mult = 1
      }

      retDist = Math.round(mult * yard)

      if (retDist === 0) {
        msg += 'No return.'
      } else {
        if (game.spot + retDist >= 100) {
          game.status = 101
          // addRecap( punt ret TD )
          retDist = 100 - game.spot
        } else if (game.spot + retDist <= 0) {
          game.status = 102
          // addRecap( punt ret safety )
          retDist = -game.spot
        }

        game.thisPlay.dist = retDist
        await this.moveBall(game, 'kick')
        game.spot += retDist

        msg += dName + ' return for ' + retDist + ' yards.'
      }
    } else if (touchback) {
      msg += dName + ' take a touchback...'
      game.spot = 20
      await this.moveBall(game, 'show')
    }

    // If you didn't score, post-punt
    if (game.status === SAFETY_KICK || game.status === PUNT) {
      game.status = 6
      game.down = 0 // CHECK: This is a band-aid
    }

    await alertBox(this, msg)
  };

  async hailMary (game) {
    let msg = null
    let dst = 0
    let die = null
    die = await Utils.rollDie(game, game.me)

    await alertBox(this, game.players[game.offNum].team.name + ' hail mary!')
    document.querySelector('.' + (game.away === game.offNum ? 'away' : 'home') + ' .hm' + game.players[game.offNum].hm).classList.add('called')

    if (die === 1) {
      msg = 'BIG SACK!'
      dst = -10
    } else if (die === 2) {
      dst = 20
    } else if (die === 3) {
      dst = 0
    } else if (die === 4) {
      dst = 40
    } else if (die === 5) {
      msg = 'PICKED!'
      await this.changePoss(game, 'to')
    } else {
      dst = 101
    }

    if (msg) {
      await alertBox(this, msg)
    }

    game.thisPlay.multiplierCard = '/'
    game.thisPlay.yardCard = '/'
    game.thisPlay.multiplier = '/'
    game.thisPlay.dist = dst

    game.players[game.offNum].hm--
  };

  // END OF PLAY - WE HAVE THE DATA, LET'S GO!!!
  async endPlay (game) {
    const p1 = game.players[1].currentPlay
    const p2 = game.players[2].currentPlay

    if ((game.status >= REG && game.status <= SAME) || game.status === HAIL) {
      await this.calcDist(game, p1, p2)

      if (game.animation) {
        await this.reportPlay(game, p1, p2)
      // } else {
      //   this.gameLog.push('Last play: ' + p1 + ' v ' + p2 + ' | ' + 'Distance: ' + game.thisPlay.dist + '-yard ' + (game.thisPlay.dist >= 0 ? 'gain' : 'loss'))
      }

      // if (!game.twoPtConv && game.status < FG || game.status > PUNT) {
      //     saveDist(game.offNum)  // LATER: When we have stats
      // }

      if (game.twoPtConv) {
        game.spot = game.thisPlay.dist + game.spot
      }
    }

    const recentScore = await this.checkScore(game, game.thisPlay.bonus, game.thisPlay.dist)

    if (!(game.isOT() && game.otPoss < 0) && !game.twoPtConv && ((game.status > OT_START && game.status < FG) || game.status === HAIL)) {
      await this.updateDown(game, recentScore)
    }

    if (!game.twoPtConv) {
      await this.timeChanger(game)
    }

    if (game.status > INIT && game.status < REG && game.status !== OT_START) {
      game.status = REG
    }
  };

  async calcDist (game, p1, p2) {
    if (!game.thisPlay.multiplierCard && !game.thisPlay.multiplier) {
      game.thisPlay.multiplierCard = await game.decMults(game.me)
    } else if (game.thisPlay.multiplierCard !== '/') {
      game.thisPlay.multiplierCard = '/'
    }

    if (!game.thisPlay.multiplier && game.thisPlay.multiplierCard === '/') {
      game.thisPlay.multiplier = '/'
    } else if (game.thisPlay.multiplierCard !== '/') {
      game.thisPlay.multiplier = this.calcTimes(game, p1, p2, game.thisPlay.multiplierCard.num)
    }

    if (game.thisPlay.multiplier !== 0 && !game.thisPlay.yardCard) {
      game.thisPlay.yardCard = await game.decYards(game.me)
    } else {
      game.thisPlay.yardCard = 0
    }

    if (game.thisPlay.dist === null) {
      game.thisPlay.dist = Math.round(game.thisPlay.yardCard * game.thisPlay.multiplier) + game.thisPlay.bonus
    }

    // Check for touchdowns
    if (game.spot + game.thisPlay.dist >= 100) {
      game.thisPlay.bonus = game.thisPlay.dist
      game.thisPlay.dist = 100 - game.spot
      if (!game.twoPtConv) {
        game.status = 101
      }
    }

    // Check for safeties
    if (game.spot + game.thisPlay.dist <= 0) {
      game.thisPlay.bonus = game.thisPlay.dist
      game.thisPlay.dist = -game.spot
      if (!game.twoPtConv) {
        game.status = 102
      }
    }
  };

  calcTimes (game, p1, p2, multIdx) {
    const p1Num = 'SRLRSPLPTP'.indexOf(p1) / 2
    const p2Num = 'SRLRSPLPTP'.indexOf(p2) / 2
    let match = 0

    if (p1Num === 4 || p2Num === 4) {
      match = 1
      game.thisPlay.quality = '/'
    } else {
      match = MATCHUP[game.offNum === 1 ? p1Num : p2Num][game.offNum === 1 ? p2Num : p1Num]
    }

    if (game.status === SAME) {
      game.thisPlay.quality = 'Same'
    } else if (game.thisPlay.quality !== '/') {
      game.thisPlay.quality = match
    }

    return MULTI[multIdx - 1][match - 1]
  };

  async reportPlay (game, p1, p2) {
    const times = !game.thisPlay.multiplier ? '/' : null
    const mCard = game.thisPlay.multiplierCard === '/' ? '/' : game.thisPlay.multiplierCard.card
    let thisOffPlay = null
    let thisDefPlay = null

    animationSimple(this.scoreboardContainerBotLeft, 'collapsed')
    animationSimple(this.scoreboardContainerBotRight, 'collapsed')
    animationSimple(this.scoreboardContainerTopLeft, 'collapsed')
    animationSimple(this.scoreboardContainerTopRight, 'collapsed')

    document.querySelector('.' + (game.away === game.offNum ? 'away-msg' : 'home-msg') + '.top-msg').innerText = 'FootBored'
    document.querySelector('.' + (game.home === game.offNum ? 'home-msg' : 'away-msg') + '.top-msg').innerText = 'Last play: ' + p1 + ' v ' + p2 + ' | Distance: ' + game.thisPlay.dist + '-yard ' + (game.thisPlay.dist >= 0 ? 'gain' : 'loss')

    this.gameLog.push('Last play: ' + p1 + ' v ' + p2 + ' | ' + 'Distance: ' + game.thisPlay.dist + '-yard ' + (game.thisPlay.dist >= 0 ? 'gain' : 'loss'))
    this.plCard1.querySelector('.back').innerText = game.players[game.offNum].currentPlay
    if (game.offNum === game.home) {
      this.plCard1.querySelector('.back').classList.add('back-home')
    }
    await animationWaitForCompletion(this.plCard1, 'picked')

    // Figure out if plays exist (for TP, etc)
    this.qualityOffPlays.forEach(play => {
      if (play.innerText === game.players[game.offNum].currentPlay) {
        thisOffPlay = play
      }
    })
    this.qualityDefPlays.forEach(play => {
      if (play.innerText === game.players[game.defNum].currentPlay) {
        thisDefPlay = play
      }
    })

    if (thisOffPlay && thisDefPlay) {
      thisOffPlay.classList.add('active')
      await sleep(500)
    }

    this.plCard2.querySelector('.back').innerText = game.players[game.defNum].currentPlay
    if (game.defNum === game.home) {
      this.plCard2.querySelector('.back').classList.add('back-home')
    }
    await animationWaitForCompletion(this.plCard2, 'picked')

    if (thisOffPlay && thisDefPlay) {
      thisDefPlay.classList.add('active')
      await sleep(500)
      this.qualityContainer.querySelector(('.' + game.players[game.offNum].currentPlay + '-v-' + game.players[game.defNum].currentPlay).toLowerCase()).classList.add('active')
      await sleep(500)
    }

    const quality = game.thisPlay.getQuality().toLowerCase()
    console.log(quality)

    if (quality !== 'same') {
      this.qualityFooter.querySelector('.qual-' + quality).classList.add('active')
      await sleep(500)

      this.timesHeader.classList.add('qual-' + quality)
      this.timesHeader.innerText = 'Call Quality: ' + quality.charAt(0).toUpperCase() + quality.slice(1)

      let qualityArray = [4, 3, 2, 0] // Best
      if (quality === 'good') {
        qualityArray = [3, 2, 1, 0]
      } else if (quality === 'decent') {
        qualityArray = [2, 1, 0.5, 0]
      } else if (quality === 'okay') {
        qualityArray = [1.5, 1, 0, -1]
      } else if (quality === 'worst') {
        qualityArray = [1, 0.5, 0, -1]
      }

      this.timesFooter.querySelector('.times-king').innerText = qualityArray[0] + 'X'
      this.timesFooter.querySelector('.times-queen').innerText = qualityArray[1] + 'X'
      this.timesFooter.querySelector('.times-jack').innerText = qualityArray[2] + 'X'
      this.timesFooter.querySelector('.times-10').innerText = qualityArray[3] + 'X'
    } else {
      this.timesHeader.innerText = 'Same play!!!'
    }

    await animationWaitForCompletion(this.qualityContainer, 'fade')

    // this.qualityContainer.querySelector('.back').innerText = game.thisPlay.getQuality()
    // await animationWaitForCompletion(this.qualityContainer, 'picked')

    this.multCard.querySelector('.back').innerText = mCard
    if (mCard !== '/') {
      this.multCard.querySelector('.back').classList.add('times-' + mCard.toLowerCase())
    }
    await animationWaitForCompletion(this.multCard, 'picked')
    if (mCard !== '/') {
      this.timesFooter.querySelector('.times-' + mCard.toLowerCase()).classList.add('active')
      await sleep(500)
    }

    // this.timesContainer.querySelector('.back').innerText = (times || game.thisPlay.multiplier) + 'X'
    // await animationWaitForCompletion(this.timesContainer, 'picked')

    this.yardCard.querySelector('.back').innerText = game.thisPlay.yardCard
    if (game.offNum === game.home) {
      this.yardCard.querySelector('.back').classList.add('back-home')
    }
    await animationWaitForCompletion(this.yardCard, 'picked')

    this.setLastPlay(game)

    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    this.playerContainer.classList.toggle('fade', true)
    await setBallSpot(this)

    animationSimple(this.scoreboardContainerTopLeft, 'collapsed', false)
    animationSimple(this.scoreboardContainerTopRight, 'collapsed', false)
  };

  async checkScore (game, bon, dst) {
    const ono = game.offNum
    const dno = game.defNum
    const oname = game.players[ono].team.name
    let good = false
    let coin
    let recentScore = 0

    // Two-Point Conversion
    if (game.twoPtConv) {
      if (game.spot + game.thisPlay.dist >= 100 && !game.turnover) {
        if (bon > dst) {
          good = true
        } else if (bon === dst) {
          coin = await Utils.coinFlip(game, game.me)

          if (coin) {
            good = true
          }
        }

        if (good) {
          await this.scoreChange(game, ono, 2)
          recentScore = 2
        } else {
          if (game.changeTime < PEN_DOWN || game.changeTime > PEN_NO_DOWN) {
            await alertBox(this, oname + ' 2-point conversion no good!')
          }
        }
      } else if ((game.spot + dst <= 0 || game.spot + dst >= 100) && game.turnover) {
        await this.scoreChange(game, dno, 2)
        recentScore = 2
      } else {
        if (game.changeTime < PEN_DOWN || game.changeTime > PEN_NO_DOWN) {
          await alertBox(this, oname + ' 2-point conversion no good!')
        }
      }

      if (game.changeTime < PEN_DOWN || game.changeTime > PEN_NO_DOWN) {
        game.twoPtConv = false
        if (!game.isOT()) {
          game.status = KICKOFF
        } else {
          game.status = REG
        }
      }
    }

    if (game.status === 101) {
      await this.touchdown(game)
      recentScore = 6
    }

    if (game.status === 102) {
      await this.safety(game)
      recentScore = 2
    }

    return recentScore
  };

  async scoreChange (game, scrNo, pts) {
    const nameEl = game.run.scoreboardContainer.querySelector((scrNo === game.away ? '.away' : '.home') + '.team')
    const scoreEl = game.run.scoreboardContainer.querySelector((scrNo === game.away ? '.away' : '.home') + '.score')
    const temp = nameEl.innerText
    let msg1, msg2
    let msg3 = null

    if (pts === 1) {
      msg1 = 'XP'
      msg2 = 'extra point was good!'
      msg3 = null
    } else if (pts === 2 && game.status === 102) {
      msg1 = 'SAFE'
      msg2 = 'forced a safety!!'
      msg3 = null
    } else if (pts === 2 && scrNo === game.defNum) {
      msg1 = 'RET'
      msg2 = 'returned 2-point conversion!!!'
      msg3 = null
    } else if (pts === 2) {
      msg1 = '2-PT'
      msg2 = '2-point conversion is good!!'
      msg3 = null
    } else if (pts === 3) {
      msg1 = 'FG'
      msg2 = 'field goal is good!!'
      msg3 = null
    } else {
      msg1 = 'TD'
      msg2 = 'scored a touchdown!!!'
      msg3 = 'TOUCHDOWN'
    }

    if (msg1 === 'TD') {
      await setBallSpot(this, 105)
    } else if (msg1 === 'SAFE' || msg1 === 'RET') {
      await setBallSpot(this, -5)
    }

    if (msg3 !== null) {
      this.tdAnim.querySelector('.td-text').innerText = msg3

      // Add home color
      if (scrNo === game.home) {
        const paths = this.tdAnim.querySelectorAll('path')
        paths.forEach(path => {
          path.classList.add('td-home')
        })
      }

      this.tdAnim.classList.toggle('hidden', false)
      this.tdAnim.classList.toggle('fade', false)
      this.tdAnim.querySelector('.td-frame1').classList.toggle('spin', true)
      await sleep(2000)
    }

    await animationWaitForCompletion(nameEl, 'just-scored')
    // nameEl.classList.toggle('poss')
    await animationWaitForCompletion(scoreEl, 'just-scored')
    nameEl.innerText = msg1
    await animationWaitForCompletion(nameEl, 'just-scored', false)
    await alertBox(this, game.players[scrNo].team.name + ' ' + msg2)

    game.players[scrNo].score += pts
    this.printScore(game, this.scoreboardContainer)

    await animationWaitForCompletion(scoreEl, 'just-scored', false)
    await animationWaitForCompletion(nameEl, 'just-scored')
    nameEl.innerText = temp
    // nameEl.classList.toggle('poss')
    animationSimple(nameEl, 'just-scored', false)

    if (msg3 !== null) {
      this.tdAnim.classList.toggle('fade', true)
      this.tdAnim.querySelector('.td-frame1').classList.toggle('spin', false)

      // Remove home color
      if (scrNo === game.home) {
        const paths = this.tdAnim.querySelectorAll('path')
        paths.forEach(path => {
          path.classList.remove('td-home')
        })
      }

      this.tdAnim.classList.toggle('hidden', true)
    }

    // Also add to the stats at this point
    // Add to the quarter score for the game recap
  };

  async safety (game) {
    await this.scoreChange(game, game.defNum, 2)
    if (game.isOT()) {
      game.otPoss = 0
    } else {
      game.status = SAFETY_KICK
    }
    // addRecap( safety )
  };

  async touchdown (game) {
    await this.scoreChange(game, game.offNum, 6)
    game.players[game.offNum].currentPlay = null

    // addRecap ( touchdown )
    if (this.patNec(game)) {
      await this.pat(game)
    }

    if (game.isOT()) {
      game.otPoss = -game.otPoss
    }
  };

  async fgAnimation (game, fgSpot, result = true) {
    await animationWaitForCompletion(this.scoreboardContainer, 'slide-up')
    await setBallSpot(this, 100 - fgSpot)
    this.ball.classList.add(result ? 'fg-good' : 'fg-bad')
    await sleep(3000)
    this.ball.classList.toggle('fg-good', false)
    this.ball.classList.toggle('fg-bad', false)
    await animationWaitForCompletion(this.scoreboardContainer, 'slide-up', false)
  };

  patNec (game) {
    const endGameNoTO = game.qtr === 4 && game.currentTime === 0 && game.changeTime !== TIMEOUT
    const endOT = game.isOT() && (game.otPoss === 1 || (game.otPoss === 2 && game.turnover))
    const scoreDiff = game.players[game.offNum].score > game.players[game.defNum].score || game.players[game.defNum].score - game.players[game.offNum].score > 2

    return !((endGameNoTO || endOT) && scoreDiff)
  };

  async pat (game) {
    const oName = game.players[game.offNum].team.name
    let selection = '2P' // Default in 3OT+

    if (game.qtr < 7) { // Must go for 2 in 3OT+
      selection = await this.input.getInput(game, game.offNum, 'pat', game.players[game.offNum].team.name + ' pick PAT type...')
    }

    if (selection === '2P') {
      // printDown('2PT');
      game.spot = 98
      await setBallSpot(this)
      if (game.changeTime !== TIMEOUT) {
        game.changeTime = TWOPT // Two-point
      }
      game.twoPtConv = true
    } else {
      // printDown('XP');
      let die
      die = await Utils.rollDie(game, game.me)
      if (die === 6) {
        die = await Utils.coinFlip(game, game.me)
        if (!die) {
          die = 6
        }
      }

      if (die !== 6) {
        await this.fgAnimation(game, 22, true)
        await this.scoreChange(game, game.offNum, 1)
      } else {
        await this.fgAnimation(game, 22, false)
        await alertBox(this, oName + ' extra point was no good...')
        // Might need some graphics here
      }

      // addRecap( xp [no] good );

      if (!game.isOT()) {
        game.status = KICKOFF // Get ready for kickoff
      } else {
        game.status = REG // Get ready for next OT play
      }
    }
  };

  async updateDown (game, recentScore = 0) {
    // Recent score is -1 during resetting states
    let coin

    // BREADCRUMB: IF INIT OR INIT_OTC, DON'T DISPLAY A BUNCH OF SHIT, JUST UPDATE
    // if init kick then just get it right

    if (game.down !== 0 && !recentScore) {
      game.spot += game.thisPlay.dist
    }

    await setBallSpot(this)

    // Sticks
    if (game.spot === game.firstDown && !recentScore) {
      this.firstAnim.classList.toggle('hidden')
      await alertBox(this, 'Sticks...')
      // await sleep(1)
      await animationWaitForCompletion(this.firstAnim, 'fade', false)
      coin = await Utils.coinFlip(game, game.me)

      if (!coin) {
        await animationWaitForCompletion(this.firstStick, 'bad')
        await alertBox(this, 'Almost!')
      } else {
        await animationWaitForCompletion(this.firstStick, 'good')
      }

      await animationWaitForCompletion(this.firstAnim, 'fade')
      await sleep(10)
      this.firstAnim.classList.toggle('hidden')
      this.firstStick.className = 'first-stick'
    }

    if (game.down === 0) {
      coin = 1
    }

    if (game.spot > game.firstDown || coin) {
      if (game.down !== 0) {
        if (game.status !== INIT && game.status !== INIT_OTC && game.status !== OT_START && !recentScore) {
          await alertBox(this, 'First down!')
          await firstDownLine(this)
        }
      }
      game.down = 1

      if (game.spot > 90) {
        game.firstDown = 100
      } else {
        game.firstDown = game.spot + 10
      }

      // print_down(game);

      if (game.status > 10 && !recentScore) {
        // LATER: Inc player's first downs here
      }

      coin = 1
    }

    if (!coin && game.changeTime !== PEN_DOWN) {
      game.down += 1
    }

    if (game.down > 4 && !recentScore) { // WATCH THIS
      await alertBox(this, 'Turnover on downs!!!')
      await this.changePoss(game, 'to')

      game.down = 1
    }

    // print_down(game);
    this.showBoard(game, document.querySelector('.scoreboard-container'))
  };

  async timeChanger (game) {
    console.log('timeChanger')
    if (game.qtr <= 4 && game.changeTime === CHANGE) {
      await this.tickingClock(game.currentTime, game.currentTime - 0.5)
      game.currentTime -= 0.5
      // Inc TOP for offense
    }

    // OT START
    if (game.currentTime === -0.5 && game.qtr === 4) {
      game.status = OT_START
      game.down = 0
    }

    // LATER: Add this for OT
    if (game.otPoss < 0) {
      if (game.isOT() && this.otPossSwitch(game)) {
        this.changePoss(game, 'ot')
      } else {
        await this.otPossReset(game)
        game.otPoss = Math.abs(game.otPoss) - 1
      }
    }

    if (game.qtr > 4 && game.otPoss === 0) {
      game.currentTime = -0.5
    }
  };

  async otPossReset (game) {
    game.down = 0
    game.spot = 75
    game.firstDown = 85
    await setBallSpot(this)
    await firstDownLine(this)
    this.updateDown(game, -1)
  }

  async tickingClock (oldTime, newTime) {
    const clockTime = this.scoreboardContainer.querySelector('.clock .time')
    let curTime = oldTime
    if (this.game.animation && oldTime !== 'end' && newTime >= 0) {
      while (curTime > newTime) {
        clockTime.innerText = this.printTime(curTime)
        curTime -= 1 / 60
        await sleep(10)
      }
    }
    clockTime.innerText = this.printTime(newTime)
  }

  otQtrSwitch (game) {
    const qtrEven = !(game.qtr % 2)
    const offRecdFirst = game.offNum === game.recFirst
    let swtch = false

    if ((!qtrEven && !offRecdFirst && game.otPoss === 2) || (qtrEven && offRecdFirst && game.otPoss === 2)) {
      swtch = true
    }

    return swtch
  }

  async endGame (game) {
    const winner = (game.players[1].score > game.players[2].score) ? 1 : 2
    const wName = game.players[winner].team.name

    // printQtr('FINAL');
    // display game over
    // statBoard()
    // record final qtr scores
    await alertBox(this, wName + ' win the game ' + game.players[winner].score + ' - ' + game.players[game.opp(winner)].score + '!!!')
    game.status = 900 + winner
    // this.EnablePlayButton(document.querySelector('.playButton'));
    // fireworks();
    // storeStats(winner, false);

    this.tdAnim.querySelector('.td-text').innerText = wName.toUpperCase() + ' WIN!!!'

    this.ball.classList.add('fade')

    // Add home color
    if (winner === game.home) {
      const paths = this.tdAnim.querySelectorAll('path')
      paths.forEach(path => {
        path.classList.add('td-home')
      })
    }

    this.tdAnim.addEventListener('click', () => {
      window.location.reload()
    })

    this.tdAnim.classList.toggle('hidden', false)
    this.tdAnim.classList.toggle('fade', false)
    this.tdAnim.querySelector('.td-frame1').classList.toggle('spin', true)
    await sleep(5000)

    await alertBox(this, 'Tap the player to play another game! 🏈 🏈 🏈')
  };

  otPossSwitch (game) {
    const qtrEven = !(game.qtr % 2)
    const offEqRec = game.offNum === game.recFirst
    const otp = game.otPoss
    let possSwitch = false

    if (!qtrEven && offEqRec && otp === -2 || !qtrEven && !offEqRec && otp === -1 || qtrEven && !offEqRec && otp === -2 || qtrEven && offEqRec && otp === -1) {
      possSwitch = true
    }

    return possSwitch
  };

  // async setModalMessage (modalMessage) {
  //   const modal = document.querySelector('.modal-message')
  //   const modalButton = modal.querySelector('.modal-button')

  //   modal.classList.toggle('hidden', false)
  //   modal.classList.toggle('fade', false)

  //   modal.querySelector('.modal-header').innerText = modalMessage.header
  //   modal.querySelector('.modal-body').innerText = modalMessage.body
  //   modalButton.innerText = modalMessage.buttonText
  //   modalButton.addEventListener('click', async () => {
  //     if (modalMessage.buttonAction === 'next') {
  //       this.setModalButton(MODAL_MESSAGES[modalMessage.buttonGoTo])
  //     } else {
  //       await animationWaitThenHide(modal, 'fade')
  //     }
  //   })
  // };
}

export const setModalMessage = async (modalMessage) => {
  const modal = document.querySelector('.modal-message')
  const modalButton = modal.querySelector('.modal-button')

  modal.querySelector('.modal-header').innerText = modalMessage.header
  modal.querySelector('.modal-body').innerText = modalMessage.body
  modalButton.innerText = modalMessage.buttonText
  modalButton.setAttribute('data-button-value', modalMessage.buttonGoTo)
  modal.scrollTop = 0
  modalButton.addEventListener('click', async () => {
    if (modalMessage.buttonAction === 'next') {
      // await animationWaitForCompletion(modal, 'fade')
      return modalMessage.buttonGoTo
    } else {
      await animationWaitForCompletion(modal, 'fade')
      modal.scrollTop = 0
      modal.classList.add('hidden')
      return null
    }
  })

  modal.classList.toggle('hidden', false)
  modal.classList.toggle('fade', false)
}
