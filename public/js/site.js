export default class Site {
  constructor (root) {
    this.user = null // ADD: User class
    this.game = null // Set to current game
    this.numberPlayers = 1 // or 2 or 0
    this.connections = [null, 'local', 'computer'] // or 'local', 'computer', 'host', 'remote'
    this.connectionType = 'single' // or 'host' or 'remote'
    // this.host = true // or false
    this.channel = null // or Pusher channel
    this.team1 = null // or Team object
    this.team2 = null // or Team object
    this.home = 2 // or 1
    this.gameType = 'reg' // or 'otc'
    this.qtrLength = 7 // or some other int (1-15)
    this.gameMode = 'rookie' // or 'pro'
    this.me = 1 // or 2 or 0
    this.animation = true // or false
  }

  get host () {
    return this.connectionType === 'host' || this.connectionType === 'single' || this.connectionType === 'computer-host'
  }
}
