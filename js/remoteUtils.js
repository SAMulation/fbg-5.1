export default {

  async randInt (min, max, game = null, p = null) {
    min = Math.ceil(min)
    max = Math.floor(max)
    let answer = Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive

    if (p) {
      if (game.connection.type === 'remote') {
        answer = await game.run.receiveInputFromRemote()
      } else {
        game.run.sendInputToRemote(answer)
      }
    }

    return answer
  },

  async coinFlip (game = null, p = null) {
    return await this.randInt(0, 1, game, p)
  },

  async rollDie (game = null, p = null) {
    return await this.randInt(1, 6, game, p)
  }
}
