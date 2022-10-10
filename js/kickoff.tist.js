export default class Kickoff {
  constructor (game) {
    this.game = game
    this.pick1 = ['RK', 'OK', 'SK']
    this.pick2 = ['RR', 'OR', 'TB']
    this.mCards = ['King', 'Queen', 'Jack', '10']
    this.yCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    this.die = [1, 2, 3, 4, 5, 6]
    this.die2 = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    this.odds2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  }

  // testing() {
  //     this.pick1.forEach(el1 => {
  //         this.pick2.forEach(el2 => {
  //             if (el1 === 'RK' && el2 === 'RR') {
  //                 this.die.forEach(el3 => {
  //                     this.mCards.forEach(el4 => {
  //                         this.yCards.forEach(el5 => {
  //                             this.kickoff(el1, el2, el3, el4, el5);
  //                         });
  //                     });
  //                 });
  //             } else if (el1 === 'RK') {
  //                 this.kickoff(el1, el2);
  //             } else if (el1 === 'OK' && el2 === 'OR') {
  //                 this.odds2.forEach(el4 => {
  //                     this.die.forEach(el3 => {
  //                         this.kickoff(el1, el2, el3, el4);
  //                     });
  //                 });
  //             } else if (el1 === 'OK') {
  //                 this.die.forEach(el4 => {
  //                     this.die.forEach(el3 => {
  //                         this.kickoff(el1, el2, el3, el4);
  //                     });
  //                 });
  //             } else if (el1 === 'SK' && el2 === 'RR') {
  //                 this.die.forEach(el3 => {
  //                     this.die2.forEach(el4 => {
  //                         this.kickoff(el1, el2, el3, el4);
  //                     });
  //                 });
  //             } else {
  //                 this.die.forEach(el3 => {
  //                     this.kickoff(el1, el2, el3);
  //                 });
  //             }
  //         });
  //     });
  // }

  kickoff (pick1 = null, pick2 = null, die1 = null, mCoddsdie2 = null, yC = null) {
    const oNum = this.game.off_num
    const dNum = this.game.def_num
    this.game.down = 0
    this.game.fst_down = 0

    this.game.run.prePlay(game, 3) // NOW: Check on this
    // debugger

    if (this.game.status === -4) {
      this.game.run.punt(game, oNum, -4) // Safety Kick
      // Regular old kickoff
    } else {
      // Reset board
      this.game.spot = 65
      this.game.thisPlay.dist = 0
      // moveBall('s');

      this.kickPage(game, oNum, pick1)

      if (this.game.status !== 999) {
        this.game.run.returnPage(game, dNum, pick2)
      }
      if (this.game.status !== 999) {
        this.game.run.kickDec(game, die1, mCoddsdie2, yC)
      }
    }
    let test = pick1 + 'v' + pick2 + (die1 ? 'd(' + die1 + ')' : '') + (mCoddsdie2 ? 'mod(' + mCoddsdie2 + ')' : '') + (yC ? 'y(' + yC + ')' : '') + '\n'
    test += 'Spot: ' + this.game.spot + ', Dist: ' + this.game.thisPlay.dist + ', Status: ' + this.game.status
    console.log(test)
  }

  kickPage (game, oNum, pick = null) {
    // const oName = game.players[oNum].team.name;
    // printDown('KICK');
    // let kckDec = null;

    if (game.isReal(oNum)) {
      this.game.run.playPages(game, oNum, 'kick', pick)
    } else {
      this.game.run.cpuPages(game, 'kick', pick)
    }

    // game.players[oNum].currentPlay = kckDec;
  }
}
