import { sleep } from './graphics.js'
export default {

  async randInt (min, max, game = null, p = null) {
    min = Math.ceil(min)
    max = Math.floor(max)
    let answer = Math.floor(Math.random() * (max - min + 1) + min) // The maximum is inclusive and the minimum is inclusive

    if (game && game.isMultiplayer()) {
      if (game.connection.type === 'remote' || game.connection.type === 'computer-remote') {
        answer = await game.run.receiveInputFromRemote()
      } else if (game.connection.type === 'host' || game.connection.type === 'computer-host') {
        await game.run.sendInputToRemote(answer)
        // await sleep(1)
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
