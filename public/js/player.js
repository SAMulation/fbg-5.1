import Stat from './stat.js'
import Team from './team.js'

export default class Player {
  // need to access quarter from parent Game class
  // minimum req: Player(game, team)
  constructor (resume = null, game, team, stats = null, init = true, score = 0, time = 3, plays = null, hm = 3) {
    if (resume) {
      const tempPlayer = JSON.parse(resume)

      this.team = JSON.parse(tempPlayer.team)
      this.score = tempPlayer.score
      this.timeouts = tempPlayer.timeouts
      this.plays = JSON.parse(tempPlayer.plays)
      this.stats = JSON.parse(tempPlayer.stats)
      this.currentPlay = null
      this.hm = tempPlayer.hm // This is hail mary
      this.stats = JSON.parse(tempPlayer.stats)
    } else {
      this.team = new Team(team)
      this.score = score
      this.timeouts = time
      this.plays = plays
      this.stats = stats
      this.currentPlay = null
      this.hm = hm // This is hail mary

      // Computer
      if (stats === null) {
        this.stats = new Stat('Computer')
        // New user
      } else if (typeof stats === 'string') {
        this.stats = new Stat(stats)
      } else {
        // Existing user
        this.stats = stats
      }
    }

    this.game = game

    if (!this.game.resume) {
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

    this.toJSON = () => {
      return {
        team: JSON.stringify(this.team),
        score: this.score,
        timeouts: this.timeouts,
        plays: JSON.stringify(this.plays),
        stats: JSON.stringify(this.stats),
        currentPlay: null,
        hm: this.hm
      }
    }
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
