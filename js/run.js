/* global Pusher */
/* global alert */

import Stat from './stat.js'
import Utils from './remoteUtils.js'
import { Queue } from './queue.js'
import { MULTI, MATCHUP, CHANGE, TB, PEN_DOWN, PEN_NO_DOWN, TIMEOUT, TWOMIN, SAFETY_KICK, KICKOFF, KICK, INIT, INIT_OTC, REG, OFF_TP, DEF_TP, SAME, FG, PUNT, HAIL, TWO_PT, TD, SAFETY, LEAVE, P1_WINS, P2_WINS, EXIT, TWOPT } from './defaults.js'
import { alertBox, sleep, setBallSpot, setSpot, animationSimple, animationWaitForCompletion, animationWaitThenHide, animationPrePick, animationPostPick, resetBoardContainer } from './graphics.js'

export default class Run {
  constructor (game, input) {
    this.game = game // Pointer to game object
    this.input = input
    this.alert = 'bar' // or 'alert' or 'console'
    this.gameSetup = document.querySelector('.game-setup-container')
    this.scoreboardContainer = document.querySelector('.scoreboard-container')
    this.scoreboardContainerTopLeft = document.querySelector('.scoreboard-container .away-msg.top-msg')
    this.scoreboardContainerTopRight = document.querySelector('.scoreboard-container .home-msg.top-msg')
    this.scoreboardContainerBotLeft = document.querySelector('.scoreboard-container .away-msg.bot-msg')
    this.scoreboardContainerBotRight = document.querySelector('.scoreboard-container .home-msg.bot-msg')
    this.fieldContainer = document.querySelector('.field-container')
    this.field = this.fieldContainer.querySelector('.field')
    this.boardContainer = document.querySelector('.board-container')
    this.plCard1 = document.querySelector('.board-container .pl-card1')
    this.plCard2 = document.querySelector('.board-container .pl-card2')
    this.multCard = document.querySelector('.board-container .mult-card')
    this.yardCard = document.querySelector('.board-container .yard-card')
    this.qualityContainer = document.querySelector('.board-container .quality-container')
    this.timesContainer = document.querySelector('.board-container .times-container')
    this.cardsContainer = document.querySelector('.cards-container')
    this.actualCards = this.cardsContainer.querySelector('.cards')
    this.timeoutButton = this.cardsContainer.querySelector('.to-butt')
    this.alertMessage = this.cardsContainer.querySelector('.bar-msg')
    this.ball = document.querySelector('.field-container .ball')
    this.docStyle = document.documentElement.style
    this.channel = null // This is the Pusher channel
    this.inbox = new Queue()
  }

  makeBarSlideable (el) {
    document.querySelector('.bar-msg').disabled = true
    document.querySelector('.bar-msg').addEventListener('click', async () => {
      await animationWaitForCompletion(el, 'slide-down', !this.cardsContainer.classList.contains('slide-down'))

      if (this.cardsContainer.classList.contains('slide-down')) {
        this.timeoutButton.disabled = true
      } else {
        if (this.timeoutButton.timeouts && this.game.changeTime === 0) {
          this.timeoutButton.disabled = false
        }
      }
    })
  }

  async setBallSpot (run) {
    const newSpot = run.game.spot
    const lastSpot = run.game.lastSpot
    await sleep(100)
    run.docStyle.setProperty('--ball-spot', (run.field.offsetHeight / 100 * ((100 - newSpot) + 42)) + 'px')
    await sleep(100)
  }

  async prepareHTML (game) {
    setSpot(this, 65) // Place ball
    await this.moveBall(game, 'show/clear')
    // Set teams' colors
    document.documentElement.style.setProperty('--away-color1', game.players[game.away].team.color1)
    document.documentElement.style.setProperty('--away-color2', game.players[game.away].team.color2)
    document.documentElement.style.setProperty('--home-color1', game.players[game.home].team.color1)
    document.documentElement.style.setProperty('--home-color2', game.players[game.home].team.color2)
    document.documentElement.style.setProperty('--me-color1', game.players[game.me].team.color1)
    document.documentElement.style.setProperty('--me-color2', game.players[game.me].team.color2)
    animationSimple(this.cardsContainer, 'slide-down') // Slide cards container down
    await animationWaitForCompletion(this.scoreboardContainer, 'slide-up') // Slide scoreboard up
    this.actualCards.innerText = '' // Clear out default cards
    await animationWaitThenHide(this.gameSetup, 'slide-away') // Slide away game setup screen
    this.makeBarSlideable(this.cardsContainer)
  }

  async playGame () {
    this.channel = this.game.connection.pusher.subscribe('private-game-' + this.game.connection.gamecode)
    this.channel.bind('client-value', (data) => {
      if (data.value === null || data.value === undefined) throw new Error('got empty value from remote')
      this.inbox.enqueue(data.value)
    })

    await this.prepareHTML(game) // Set up game board and field
    await this.gameLoop(this.game, INIT) // Start the game loop
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
      if (game.status < LEAVE) {
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
    if (game.status === INIT || game.status === INIT_OTC) {
      await this.coinToss(game)
      await this.resetVar(game)
      await animationWaitForCompletion(this.scoreboardContainer, 'slide-up', false)
    } else {
      // End of half
      if (!(game.qtr % 2)) {
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

  sendInputToRemote (value) {
    if (value === null || value === undefined) throw new Error('attempted to send empty value')
    this.channel.trigger('client-value', { value })
  }

  async receiveInputFromRemote () {
    return await this.inbox.dequeue()
  }

  async remoteCommunication (game, p, value = null, msg = null) {
    if (game.connection.connections[p] === 'remote' || game.connection.connections[p] === 'host') {
      if (value !== null) {
      // Send value to REMOTE player
        this.sendInputToRemote(value)
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

    // Coin toss decision
    // Real players
    // if (game.me === game.away) {
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down', false)
    //   coinPick = await this.input.getInput(game, game.away, 'coin', awayName + ' pick for coin toss...')
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down')
    // } else {
    //   await alertBox(this, 'Coin Toss: ' + awayName + ' choosing...')
    // }

    console.log('Connection type: ' + game.connection.type + ', Connections[me]: ' + game.connection.connections[game.me])
    console.log(game.me + ' coinPick before: ' + coinPick)
    coinPick = await this.input.getInput(game, game.away, 'coin', awayName + ' pick for coin toss...')
    console.log(game.me + ' coinPick after: ' + coinPick)

    // if (game.connection.type === 'host' || game.connection.type === 'remote') {
    //   if (game.me === game.away) {
    //     this.sendInputToRemote(coinPick)
    //   } else {
    //     coinPick = await this.receiveInputFromRemote()
    //   }
    // }

    // if (game.connection.connections[game.away] === 'computer') {
    //   coinPick = await Utils.coinFlip(game, game.me) ? 'H' : 'T'
    // }

    // Show result
    result += awayName + ' chose ' + (coinPick === 'H' ? 'heads' : 'tails') + '! '
    result += ' ... '
    // Some sort of graphic
    console.log(game.me + ' actFlip before: ' + actFlip)

    actFlip = await Utils.coinFlip(game, game.me) ? 'H' : 'T'
    console.log(game.me + ' actFlip after: ' + actFlip)

    // Maybe away

    result += 'It was ' + (actFlip === 'H' ? 'heads' : 'tails') + '!'
    await alertBox(this, result)
    console.log('checkpoint')
    // Decide if want to kick or receive
    // if ((actFlip === coinPick && game.away === game.me) || (actFlip !== coinPick && game.home === game.me)) {
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down', false)
    //   decPick = await this.input.getInput(game, (actFlip === coinPick ? game.away : game.home), (game.qtr >= 4 ? 'kickDecOT' : 'kickDecReg'))
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down')
    // } else {
    //   await alertBox(this, (actFlip === coinPick ? awayName : homeName) + ' choosing whether to kick or receive...')
    // }

    console.log(game.me + ' decPick before: ' + decPick)
    decPick = await this.input.getInput(game, (actFlip === coinPick ? game.away : game.home), (game.qtr >= 4 ? 'kickDecOT' : 'kickDecReg'))

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
    for (let t = 1; t <= to; t++) {
      for (let p = 1; p <= 2; p++) {
        if (document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + t).classList.contains('called')) {
          document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .to' + t).classList.remove('called')
        }
      }
    }

    // Refill hail mary pills
    for (let h = 1; h <= (game.qtr < 4 ? 3 : 2); h++) {
      for (let p = 1; p <= 2; p++) {
        if (document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .hm' + h).classList.contains('called')) {
          document.querySelector('.' + (game.away === p ? 'away' : 'home') + ' .hm' + h).classList.remove('called')
        }
      }
    }

    // LATER: IF NOT NEEDED, DELETE
    // if (game.qtr === 4 && game.gameType !== 'otc' && game.players[1].score === game.players[2].score) {
    //   await this.coinToss(game)
    // }

    await this.updateDown(game) // Forces game to set itself up

    if (game.qtr <= 3) {
      game.status = KICK
    } else {
      if (game.recFirst !== game.offNum) {
        await this.changePoss(game)
      }
      game.status = REG
    }

    await this.resetTime(game)

    if (!game.over) {
      if (!game.isOT()) {
        await animationWaitForCompletion(this.scoreboardContainer, 'slide-up', false)
      }

      if (game.qtr === 3 && game.offNum !== game.recFirst) {
        await this.changePoss(game)
      }
    }
  };

  async resetTime (game) {
    const over = game.qtr >= 4 && game.players[1].score !== game.players[2].score

    // Is the game over?
    if (over) {
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
        await alertBox(this, 'End of ' + this.showQuarter(game.qtr) + ' quarter')

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
        await this.moveBall(game, 'show')
        this.printMsgDown(game, this.scoreboardContainer)
        this.printMsgSpot(game, this.scoreboardContainer)
      } else {
        game.currentTime = game.qtrLength
        await this.tickingClock('end', game.currentTime)
      }

      game.qtr++
      this.printQuarter(game, this.scoreboardContainer)

      if (game.isOT() && this.ot_qtr_switch(game)) {
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
    } else {
      if (mode !== 'kick') {
        await alertBox(this, 'The ball is hiked...')
      }
      this.ball.classList.toggle('hidden', false)
      setBallSpot(this)
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
      // moveBall('s');  // Which showed ball
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
      await this.updateDown(game)
    }
  };

  setLastPlay (game) {
    game.lastPlay = game.players[game.away].currentPlay + ' v ' + game.players[game.home].currentPlay + '  |  ' + (game.thisPlay.dist === 0 ? 'No gain' : (Math.abs(game.thisPlay.dist) + '-yard ' + (game.thisPlay.dist < 0 ? 'loss' : 'gain')))
  }

  async playSelection (game, p, type, msg) {
    const selection = null
    // this.scoreboardContainerTopLeft.innerText = (p === game.away ? 'Pick your play' : game.lastPlay)
    // this.scoreboardContainerTopRight.innerText = (p === game.away ? game.lastPlay : 'Pick your play')
    // animationSimple(this.scoreboardContainerTopLeft, 'collapsed', false)
    // animationSimple(this.scoreboardContainerTopRight, 'collapsed', false)

    // if (game.me === p) {
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down', false)
    //   selection = await this.input.getInput(game, p, type, msg)
    //   if (game.isMultiplayer()) {
    //     this.sendInputToRemote(selection)
    //   }
    //   await animationWaitForCompletion(this.cardsContainer, 'slide-down')
    // } else {
    //   await alertBox(this, msg)
    //   if (game.isMultiplayer()) {
    //     selection = await this.receiveInputFromRemote()
    //   } else {
    //     await this.cpuPages(game, type)
    //   }
    // }

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
      if (!game.isReal(game.offNum)) {
        if (game.changeTime === 0) {
          await this.cpuTime(game)
        }
        await this.cpuPlay(game)
      }

      // Get play
      selection = await this.input.getInput(game, game.offNum, 'kick', oName + ' pick kickoff type...')

      // Handle timeouts being called
      if (game.players[game.offNum].currentPlay === 'TO') {
        await this.timeout(game, game.offNum)
      }

      if (selection) {
        game.players[game.offNum].currentPlay = selection
      }
    }
  }

  async returnPage (game) {
    const dName = game.players[game.defNum].team.name

    // await this.playSelection(game, game.defNum, 'ret', dName + ' pick return type...')

    while (game.status !== EXIT && !game.players[game.defNum].currentPlay) {
      let selection = null
      if (!game.isReal(game.defNum)) {
        if (game.changeTime === 0) {
          await this.cpuTime(game)
        }
        await this.cpuPlay(game)
      }

      // Get play
      selection = await this.input.getInput(game, game.defNum, 'ret', dName + ' pick return type...')

      // Handle timeouts being called
      if (game.players[game.defNum].currentPlay === 'TO') {
        await this.timeout(game, game.defNum)
      }

      if (selection) {
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
    animationSimple(this.scoreboardContainerTopLeft, 'collapsed')
    animationSimple(this.scoreboardContainerTopRight, 'collapsed')
    animationSimple(this.scoreboardContainerBotLeft, 'collapsed')
    animationSimple(this.scoreboardContainerBotRight, 'collapsed')
    await animationWaitForCompletion(this.fieldContainer, 'slide-away')

    this.plCard1.querySelector('.back').innerText = game.players[1].currentPlay
    await animationWaitForCompletion(this.plCard1, 'picked')
    this.plCard2.querySelector('.back').innerText = game.players[2].currentPlay
    await animationWaitForCompletion(this.plCard2, 'picked')

    setBallSpot(this)
    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)

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

    if (kickType === 'OK') {
      if (okResult) {
        await alertBox(this, oName + ' recover!')
        possession = false
        retDist = -retDist
      } else {
        await alertBox(this, dName + ' recover!')
      }
    }

    if (possession) {
      await this.changePoss(game, 'k')
    }

    let msg = ''
    if (!touchback) {
      await this.moveBall(game, 'kick')
      await alertBox(this, Math.abs(kickDist) + '-yard kick')
      await animationWaitForCompletion(this.fieldContainer, 'slide-away')

      this.multCard.querySelector('.back').innerText = multCard?.card || '/'
      await animationWaitForCompletion(this.multCard, 'picked')
      this.timesContainer.querySelector('.back').innerText = multiplier + 'X'
      await animationWaitForCompletion(this.timesContainer, 'picked')
      this.yardCard.querySelector('.back').innerText = yard
      await animationWaitForCompletion(this.yardCard, 'picked')

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
      if (game.changeTime === 4) {
        await this.returnTime(game)
      }
      if (game.twoMinWarning) {
        game.twoMinWarning = false
      }
      game.changeTime = TB
    }

    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    setBallSpot(this)
    await alertBox(this, msg)
  };

  async playMechanism (game) {
    await this.prePlay(game, REG)
    await this.pickPlay(game)

    if (game.status !== EXIT) {
      await this.lastChanceTO(game)
      await animationWaitForCompletion(this.fieldContainer, 'slide-away')
      await this.doPlay(game, game.players[1].currentPlay, game.players[2].currentPlay)
    }
  };

  async lastChanceTO (game) {
    let selection

    // Very end of the game
    if (game.status < 900 && ((game.qtr === 2 || game.qtr === 4) && game.currentTime === 0) && !game.changeTime) {
      for (let p = 1; p <= 2; p++) {
        // Real and have a timeout, one's not been called
        if (game.isReal(p) && game.players[p].timeouts && !game.changeTime) {
          console.log('p: ' + p + ' changeTime: ' + game.changeTime)
          alert('The ' + (game.qtr === 2 ? 'half' : 'game') + ' is about to end! Last chance for the ' + game.players[p].team.name + ' to call a timeout!')

          // // Local players
          // if (game.isPlayer(p, 'local')) {
          //   await animationWaitForCompletion(this.cardsContainer, 'slide-down', false)
          //   selection = await this.input.getInput(game, p, 'last', game.players[p].team.name + ' call a timeout?')
          //   await animationWaitForCompletion(this.cardsContainer, 'slide-down')
          // }

          // // Send remote message or receive remote message
          // selection = await this.remoteCommunication(game, p, selection, game.players[p].team.name + ' call a timeout?')
          selection = await this.input.getInput(game, p, 'last', game.players[p].team.name + ' call a timeout?')

          if (selection === 'Y') {
            await this.timeout(game, p)
          }
        }
      }
    }
  };

  async prePlay (game, stat) {
    game.thisPlay.multiplierCard = null
    game.thisPlay.yardCard = null
    game.thisPlay.multiplier = null
    game.thisPlay.quality = null
    game.thisPlay.dist = null
    game.thisPlay.bonus = 0
    game.players[1].currentPlay = null
    game.players[2].currentPlay = null

    if (game.status > KICK) {
      animationSimple(this.scoreboardContainerBotLeft, 'collapsed', false)
      animationSimple(this.scoreboardContainerBotRight, 'collapsed', false)
    }

    resetBoardContainer(this)

    if (!game.twoPtConv || game.changeTime !== 4) {
      game.changeTime = 0
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

  async twoMinCheck (game) {
    let twoMin = game.twoMinWarningute
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
    game.twoMinWarningute = twoMin
  };

  async pickPlay (game) {
    const start = game.offNum
    const change = start === 1 ? 1 : -1

    for (let p = start; p === 1 || p === 2; p += change) {
      let selection = null
      game.players[p].currentPlay = null

      // Handle computer timeouts, special plays
      while (game.status !== EXIT && !game.players[p].currentPlay) {
        if (!game.isReal(p)) {
          if (game.changeTime === 0) {
            await this.cpuTime(game)
          }
          await this.cpuPlay(game)
        }

        // Get play
        selection = await this.input.getInput(game, p, 'reg', game.players[p].team.name + ' pick your play...')

        // Handle timeouts being called
        if (selection === 'TO' || game.players[p].currentPlay === 'TO') {
          await this.timeout(game, p)
        }

        if (selection) {
          game.players[p].currentPlay = selection
        }
      }

      // Computer Stuff
      // if (game.status !== EXIT && p === 2 && !game.isReal(2)) {
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

  async cpuTime (game) {
    const toCount = game.players[2].timeouts
    const ono = game.offNum

    if (toCount > 0) {
      const qtr = game.qtr
      const ctim = game.currentTime
      const spt = game.spot
      const p1s = game.players[1].score
      const p2s = game.players[2].score
      let endHalf = false
      let lastMin = false
      let ballBack = false
      let kick = false

      // End half and losing
      endHalf = ((ono === 2 && (qtr === 2 || qtr === 4)) && p2s <= p1s && ctim <= 1 && game.down !== 4)

      // Last minute with fav||able spot
      if (!endHalf) {
        lastMin = (((ono === 1 && spt < 50) || (ono === 2 && spt >= 50)) && qtr === 2 && ctim <= 1)
      }
      // Chance to get the ball back
      if (!endHalf && !lastMin) {
        ballBack = ((qtr === 2 || qtr === 4) && ctim === 0 && ono === 1 && game.players[1].timeouts === 0 && game.down === 4)
      }
      // Timeout on kickoff
      if (!endHalf && !lastMin && !ballBack) {
        kick = (qtr === 4 && ctim <= 0.5 && game.status === -3 && p2s < p1s)
      }
      if (endHalf || lastMin || ballBack || kick) {
        await this.timeout(game, 2)
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
        game.changeTime = 4
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

  async cpuPlay (game) {
    if (game.offNum === 2) {
      const qtr = game.qtr
      const curtim = game.currentTime
      const toCount = game.players[2].timeouts
      const tchg = game.changeTime
      const qlen = game.qtrLength
      const spt = game.spot
      const hm = game.players[2].hm
      const dwn = game.down
      const fdn = game.firstDown
      const diff = game.players[1].score - game.players[2].score
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
        if (await Utils.coinFlip() && (spt >= 98 || (spt >= 50 && spt <= 70)) && fdn - spt <= 3) {
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
        game.players[2].currentPlay = dec
      }
    }
  };

  async cpuPages (game, state = 'reg') {
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
        total = game.players[2].plays[playAbrv].count
      }

      game.players[2].currentPlay = playAbrv
    } else if (state === 'pat') {
      await alertBox(this, game.players[2].team.name + ' selecting PAT type...')
      let selection = 'XP'

      const diff = game.players[1].score - game.players[2].score

      if (diff === -5 || diff === -1 || diff === 2 || diff === 5 || diff === 9 || diff === 10 || diff === 13 || diff === 17 || diff === 18) {
        selection = '2P'
      }

      game.players[2].currentPlay = selection
    } else if (state === 'kick') {
      await alertBox(this, game.players[2].team.name + ' selecting kickoff type...')
      await this.cpuTime(game)

      const qtr = game.qtr
      const ctim = game.currentTime
      const p2s = game.players[2].score
      const p1s = game.players[1].score
      let kckDec = 'RK'

      if ((qtr === 4 && ctim <= 3 && p2s < p1s) || (((qtr === 3 && ctim <= 7) || qtr === 4) && p1s - p2s > 8)) {
        kckDec = 'OK'
      } else if ((qtr === 2 || qtr === 4) && ctim <= 1 && p2s > p1s) {
        kckDec = 'SK'
      }

      game.players[2].currentPlay = kckDec
    } else if (state === 'ret') {
      await alertBox(this, game.players[2].team.name + ' selecting return type...')
      await this.cpuTime(game)

      const qtr = game.qtr
      const ctim = game.currentTime
      const p2s = game.players[2].score
      const p1s = game.players[1].score
      let retDec = 'RR'

      // Very late game and P1 losing -OR- later game and P1 losing badly
      if ((qtr === 4 && ctim <= 3 && p1s < p2s) || (((qtr === 3 && ctim <= 7) || qtr === 4) && p2s - p1s > 8)) {
        retDec = 'OR'
      } else if (Utils.coinFlip()) {
        retDec = 'TB'
      }

      game.players[2].currentPlay = retDec
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
      if (legal && abrv === 'FG' && this.game.spot < 30) {
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
    const awayTeam = scoreboard.querySelector('.away.team')
    const homeTeam = scoreboard.querySelector('.home.team')

    if (game.away === game.offNum) {
      homeTeam.classList.toggle('poss', false)
      awayTeam.classList.toggle('poss', true)
    } else {
      awayTeam.classList.toggle('poss', false)
      homeTeam.classList.toggle('poss', true)
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
    clockTime.innerText = this.printTime(game.currentTime)
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
    } else if ((multCard.card === 'Queen' && coin) || (multCard.card === 'Jack' && !coin)) {
      game.thisPlay.multiplier = 3
    } else if ((multCard.card === 'Queen' && !coin) || (multCard.card === 'Jack' && coin)) {
      game.thisPlay.multiplier = -3
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
        if (game.changeTime === 4) {
          await this.returnTime(game)
        }

        game.changeTime = 2

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
      if (game.changeTime === 4) {
        await this.returnTime(game)
      }
      game.changeTime = 2

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

    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    await alertBox(this, name + ' attempting a ' + fdst + '-yard field goal...')

    // Ice kicker
    if (game.changeTime === 4 && game.lastCallTO !== game.offNum) {
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

    // LATER: Field goal graphics will go here

    if (make) {
      await alertBox(this, name + ' field goal is good!')
      this.scoreChange(game, game.offNum, 3)
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
      await this.moveBall(game, 'show')
      // Punt
    } else {
      // Add Recap for punt, maybe remove first down sticks
    }

    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    await alertBox(this, oName + (game.status === -4 ? ' safety kick' : ' are punting') + '...')

    // Check block (not on Safety Kick)
    tmp = await Utils.rollDie(game, game.me)

    if (game.status !== -4 && tmp === 6) {
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
    if (!touchback && !block && game.status !== -4 && tmp === 6) {
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
      msg += dName + ' takes a touchback...'
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

      await this.reportPlay(game, p1, p2)

      // if (!game.twoPtConv && game.status < FG || game.status > PUNT) {
      //     saveDist(game.offNum)  // LATER: When we have stats
      // }

      if (game.twoPtConv) {
        game.spot = game.thisPlay.dist + game.spot
      }
    }

    await this.checkScore(game, game.thisPlay.bonus, game.thisPlay.dist)

    if (!game.isOT() && game.otPoss < 0 && !game.twoPtConv && (game.status < FG || game.status === HAIL)) {
      await this.updateDown(game)
    }

    if (!game.twoPtConv) {
      await this.timeChanger(game)
    }

    if (game.status > INIT && game.status < REG) {
      game.status = REG
    }
  };

  async calcDist (game, p1, p2) {
    if (!game.thisPlay.multiplierCard) {
      game.thisPlay.multiplierCard = await game.decMults(game.me)
    }

    if (!game.thisPlay.yardCard) {
      game.thisPlay.yardCard = await game.decYards(game.me)
    }

    if (!game.thisPlay.multiplier && game.thisPlay.multiplierCard === '/') {
      game.thisPlay.multiplier = '/'
    } else if (game.thisPlay.multiplierCard !== '/') {
      game.thisPlay.multiplier = this.calcTimes(game, p1, p2, game.thisPlay.multiplierCard.num)
    }

    if (!game.thisPlay.dist) {
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

    if (game.thisPlay.quality !== '/') {
      game.thisPlay.quality = match
    }

    return MULTI[multIdx - 1][match - 1]
  };

  async reportPlay (game, p1, p2) {
    const times = !game.thisPlay.multiplier ? '/' : null
    const mCard = game.thisPlay.multiplierCard === '/' ? '/' : game.thisPlay.multiplierCard.card

    animationSimple(this.scoreboardContainerBotLeft, 'collapsed')
    animationSimple(this.scoreboardContainerBotRight, 'collapsed')

    document.querySelector('.' + (game.away === game.offNum ? 'home-msg' : 'away-msg') + '.top-msg').innerText = 'Last play: ' + p1 + ' v ' + p2
    document.querySelector('.' + (game.home === game.offNum ? 'home-msg' : 'away-msg') + '.top-msg').innerText = 'Distance: ' + game.thisPlay.dist + '-yard ' + (game.thisPlay.dist >= 0 ? 'gain' : 'loss')

    this.plCard1.querySelector('.back').innerText = game.players[1].currentPlay
    await animationWaitForCompletion(this.plCard1, 'picked')
    this.plCard2.querySelector('.back').innerText = game.players[2].currentPlay
    await animationWaitForCompletion(this.plCard2, 'picked')
    this.qualityContainer.querySelector('.back').innerText = game.thisPlay.getQuality()
    await animationWaitForCompletion(this.qualityContainer, 'picked')
    this.multCard.querySelector('.back').innerText = mCard
    await animationWaitForCompletion(this.multCard, 'picked')
    this.timesContainer.querySelector('.back').innerText = (times || game.thisPlay.multiplier) + 'X'
    await animationWaitForCompletion(this.timesContainer, 'picked')
    this.yardCard.querySelector('.back').innerText = game.thisPlay.yardCard
    await animationWaitForCompletion(this.yardCard, 'picked')

    // animationSimple(this.scoreboardContainerTopLeft, 'collapsed', false)
    // animationSimple(this.scoreboardContainerTopRight, 'collapsed', false)

    this.setLastPlay(game)

    await animationWaitForCompletion(this.fieldContainer, 'slide-away', false)
    setBallSpot(this)
  };

  async checkScore (game, bon, dst) {
    const ono = game.offNum
    const dno = game.defNum
    const oname = game.players[ono].team.name
    const dname = game.players[dno].team.name
    let good = false
    let coin

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
          await alertBox(this, oname + ' 2-point conversion good!')
          this.scoreChange(game, ono, 2)
        } else {
          if (game.changeTime < 2 || game.changeTime > 3) {
            await alertBox(this, oname + ' 2-point conversion no good!')
          }
        }
      } else if ((game.spot + dst <= 0 || game.spot + dst >= 100) && game.turnover) {
        await alertBox(this, dname + ' returned 2-pt!!!')
        this.scoreChange(game, dno, 2)
      } else {
        if (game.changeTime < 2 || game.changeTime > 3) {
          await alertBox(this, oname + ' 2-point conversion no good!')
        }
      }

      if (game.changeTime < 2 || game.changeTime > 3) {
        game.twoPtConv = false
        if (!game.isOT()) {
          game.status = -3
        } else {
          game.status = REG
        }
      }
    }

    if (game.status === 101) {
      await this.touchdown(game)
    }

    if (game.status === 102) {
      await this.safety(game)
    }
  };

  scoreChange (game, scrNo, pts) {
    // This is going to include a lot of action
    // that will update the scoreboard

    // All that's needed for logic
    game.players[scrNo].score += pts

    // Also add to the stats at this point
    // Add to the quarter score for the game recap
  };

  async safety (game) {
    await alertBox(this, game.players[game.defNum].team.name + ' forced a safety!!')
    this.scoreChange(game, game.defNum, 2)
    if (game.isOT()) {
      game.otPoss = 0
    } else {
      game.status = -4
    }
    // addRecap( safety )
  };

  async touchdown (game) {
    await alertBox(this, game.players[game.offNum].team.name + ' scored a touchdown!!!')
    this.scoreChange(game, game.offNum, 6)
    this.showBoard(game, document.querySelector('.scoreboard-container'))

    // addRecap ( touchdown )
    if (this.patNec(game)) {
      await this.pat(game)
    }

    if (game.isOT()) {
      game.otPoss = -game.otPoss
    }
  };

  patNec (game) {
    const endGameNoTO = game.qtr === 4 && game.currentTime === 0 && game.changeTime !== 4
    const endOT = game.isOT() && (game.otPoss === 1 || (game.otPoss === 2 && game.turnover))
    const scoreDiff = game.players[game.offNum].score > game.players[game.defNum].score || game.players[game.defNum].score - game.players[game.offNum].score > 2

    return !((endGameNoTO || endOT) && scoreDiff)
  };

  async pat (game) {
    const oNum = game.offNum
    const oName = game.players[oNum].team.name
    let selection = '2P' // Default in 3OT+

    if (game.qtr < 7) { // Must go for 2 in 3OT+
      // PAT decision
      // Real players
      // if (game.isPlayer(game.offNum, 'local')) {
      //   await animationWaitForCompletion(this.cardsContainer, 'slide-down', false)
      //   selection = await this.input.getInput(game, game.offNum, 'pat', oName + ' pick PAT type...')
      //   await animationWaitForCompletion(this.cardsContainer, 'slide-down')
      // }

      // // Send remote message or receive remote message
      // selection = await this.remoteCommunication(game, game.offNum, selection, oName + ' pick PAT type...')

      // Computer picking (or fallback for failed communication)
      // if (!selection) {
      //   await alertBox(this, oName + ' choosing PAT type...')
      //   await this.cpuPages(game, 'pat')
      //   selection = game.players[2].currentPlay
      // }
      selection = await this.input.getInput(game, game.offNum, 'pat', game.players[p].team.name + ' pick PAT type...')
    }

    if (selection === '2P') {
      // printDown('2PT');
      game.spot = 98
      setBallSpot(this)
      if (game.changeTime !== TIMEOUT) {
        game.changeTime = TWOPT // Two-point
      }
      game.twoPtConv = true
    } else {
      // printDown('XP');
      let die
      die = await Utils.rollDie(game, game.me)
      if (die === 6) {
        die = null
        die = await Utils.coinFlip(game, game.me)
        if (!die) {
          die = 6
        }
      }
      // printFG(die !== 6);

      if (die !== 6) {
        await alertBox(this, oName + ' XP good!')
        this.scoreChange(game, oNum, 1)
      } else {
        await alertBox(this, oName + ' XP no good...')
        // Might need some graphics here
      }

      // addRecap( xp [no] good );

      if (!game.isOT()) {
        game.status = -3 // Get ready for kickoff
      } else {
        game.status = REG // Get ready for next OT play
      }
    }
  };

  async updateDown (game) {
    let coin

    // BREADCRUMB: IF INIT OR INIT_OTC, DON'T DISPLAY A BUNCH OF SHIT, JUST UPDATE
    // if init kick then just get it right

    if (game.down !== 0) {
      game.spot += game.thisPlay.dist
    }

    setBallSpot(this)

    // Sticks
    if (game.spot === game.firstDown) {
      await alertBox(this, 'Sticks...')
      coin = await Utils.coinFlip(game, game.me)

      if (!coin) {
        await alertBox(this, 'Almost!')
      }
    }

    if (game.down === 0) {
      coin = 1
    }

    if (game.spot > game.firstDown || coin) {
      if (game.down !== 0) {
        await alertBox(this, 'First down!')
        // print_down(game);
      }
      game.down = 1

      if (game.spot > 90) {
        game.firstDown = 100
      } else {
        game.firstDown = game.spot + 10
      }

      // print_down(game);

      if (game.status > 10) {
        // LATER: Inc player's first downs here
      }

      coin = 1
    }

    if (!coin && game.changeTime !== 2) {
      game.down += 1
    }

    if (game.down > 4) {
      await alertBox(this, 'Turnover on downs!!!')
      await this.changePoss(game, 'to')

      game.down = 1
    }

    // print_down(game);
    this.showBoard(game, document.querySelector('.scoreboard-container'))
  };

  async timeChanger (game) {
    console.log('timeChanger')
    if (game.qtr <= 4 && game.changeTime === 0) {
      await this.tickingClock(game.currentTime, game.currentTime - 0.5)
      game.currentTime -= 0.5
      // Inc TOP for offense
    }

    // LATER: Add this for OT
    // if (game.otPoss < 0) {
    //     if (game.isOT() && game.otPoss_switch(qtr, ono, recFirst, otPoss)) {
    //         changePoss(game, 'ot');
    //     } else {
    //         this.otPoss_switch2()
    //         game.otPoss = Math.abs(game.otPoss) - 1;
    //     }
    // }

    if (game.qtr > 4 && game.otPoss === 0) {
      game.currentTime = -0.5
    }
  };

  async tickingClock (oldTime, newTime) {
    const clockTime = document.querySelector('.clock .time')
    let curTime = oldTime
    if (oldTime !== 'end') {
      while (curTime > newTime) {
        clockTime.innerText = this.printTime(curTime)
        curTime -= 1 / 60
        await sleep(10)
      }
    }
    clockTime.innerText = this.printTime(newTime)
  }

  ot_qtr_switch (game) {
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
  };

  otPoss_switch (game) {
    const qtrEven = !(game.qtr % 2)
    const offEqRec = game.offNum === game.recFirst
    const otp = game.otPoss
    let possSwitch = false

    if (!qtrEven && offEqRec && otp === -2 || !qtrEven && !offEqRec && otp === -1 || qtrEven && !offEqRec && otp === -2 || qtrEven && offEqRec && otp === -1) {
      possSwitch = true
    }

    return possSwitch
  };
}
