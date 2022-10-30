// LATER: CHANGE ALL 999 to null

export default class Stat {
  constructor (stats) {
    // Current Game Stats
    this.currentPlay = 0
    this.currentYards = 0
    this.currentPassYards = 0
    this.currentRunYards = 0
    this.currentFirstDowns = 0
    this.currentTurnorvers = 0
    this.currentTimeOfPoss = 0
    this.qtrScore = []

    // Lifetime stats
    // Just passed string: New User
    if (typeof stats === 'string') {
      this.name = stats
      this.totalGames = 0
      this.gamesWon = 0
      this.gamesLost = 0
      this.gamesForfeited = 0
      this.pointsFor = 0
      this.pointsAgainst = 0
      this.totalPlays = 0
      this.totalYards = 0
      this.totalPassYards = 0
      this.totalRunYards = 0
      this.totalFirstDowns = 0
      this.totalTurnorvers = 0
      this.totalTimeOfPoss = 0

      // LATER: Send to database
    } else {
      this.name = stats.name
      this.totalGames = stats.totalGames
      this.gamesWon = stats.gamesWon
      this.gamesLost = stats.gamesLost
      this.gamesForfeited = stats.gamesForfeited
      this.pointsFor = stats.pointsFor
      this.pointsAgainst = stats.pointsAgainst
      this.totalPlays = stats.totalPlays
      this.totalYards = stats.totalYards
      this.totalPassYards = stats.totalPassYards
      this.totalRunYards = stats.totalRunYards
      this.totalFirstDowns = stats.totalFirstDowns
      this.totalTurnorvers = stats.totalTurnorvers
      this.totalTimeOfPoss = stats.totalTimeOfPoss
    }
  }
}
