import Team from './team.js'

export default class Player {
  // need to access quarter from parent Game class
  // minimum req: Player(game, team)
  constructor (game, team, init = true, score = 0, time = 3, plays = null, hm = 3, stats = null) {
    this.game = game
    this.team = new Team(team)
    this.score = score
    this.timeouts = time
    this.plays = plays
    this.stats = stats
    this.currentPlay = ''
    this.hm = hm // This is hail mary, I'm moving this here

    if (init) {
      this.score = 0
      if (this.game.qtr < 5) {
        this.timeouts = 3
      } else {
        this.timeouts = 2
      }
    }

    if (!plays) {
      this.fillPlays('a', this.game.qtr)
    }

    // LATER: Come up with Stats class
    // if (!stats) {
    //     this.stats = new Stats();
    // }
  }

  fillPlays (option, qtr = 4) {
    let hm = (qtr > 4 ? 2 : 3)

    if (option === 'a' || option === 'p') {
      if (option === 'p') { // cache hm
        hm = this.hm
      }

      this.plays = {
        SR: {
          name: 'Short Run',
          abrv: 'SR',
          count: 3,
          type: 'reg'
        },
        LR: {
          name: 'Long Run',
          abrv: 'LR',
          count: 3,
          type: 'reg'
        },
        SP: {
          name: 'Short Pass',
          abrv: 'SP',
          count: 3,
          type: 'reg'
        },
        LP: {
          name: 'Long Pass',
          abrv: 'LP',
          count: 3,
          type: 'reg'
        },
        TP: {
          name: 'Trick Play',
          abrv: 'TP',
          count: 1,
          type: 'reg'
        }
      }

      // Fill Hail Mary
      this.hm = hm

      console.log('Refilling Play Cards')
    }
  }

  decPlays (idx) {
    if (idx === 'HM') { // 5) {  // HM
      this.hm--
    } else {
      this.plays[idx].count--
      let fill = true

      for (const play in this.plays) {
        if (play !== 'HM' && this.plays[play].count > 0) {
          fill = false
          return
        }
      }

      if (fill) {
        this.fillPlays('p')
      }
      // }
    }
  }
}
