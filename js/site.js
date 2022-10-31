export default class Site {
  constructor (root) {
    this.user = null // ADD: User class
    this.game = null // Set to current game
    this.numberPlayers = 1 // or 2 or 0
    this.connectionType = 'single' // or 'host' or 'remote'
    // this.host = true // or false
    this.channel = null // or Pusher channel
    this.team1 = null // or Team object
    this.team2 = null // or Team object
    this.home = 2 // or 1
    this.gameType = 'reg' // or 'otc'
    this.qtrLength = 7 // or some other int (1-15)
    this.gameMode = 'rookie' // or 'pro'
  }

  get host () {
    return this.connectionType === 'host' || this.connectionType === 'single'
  }
}
