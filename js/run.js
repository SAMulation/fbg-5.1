import Utils from './utils.js'

export default class Run {
    constructor(game, input) {
        // Pointer to game object
        this.game = game; 
        this.input = input; 
        this.alert = 'subhead';  // 'skip' or ''
    }

    // pressPlayButton(button) {
    //     button.addEventListener('pointerdown', event => {
    //         playGame(window.game);
    //         event.target.setAttribute('disabled', '')
    //     });
    // };
    
    // EnablePlayButton(button) {
    //     button.innerText = 'Play Again?';
    //     button.disabled = false;
    //     this.pressPlayButton(button);
    // };

    alertBox(msg) {
        if (this.alert === 'alert') {
            alert(msg);
        } else if (this.alert === 'subhead') {
            const el = document.createElement("p");
            const t = document.createTextNode(msg);
            el.appendChild(t);
            // LATER: Add class, if needed // el.classList.add('play');
            document.querySelector('.page-subheader').appendChild(el);
        } else {
            console.log(msg);
        }
    };

    legalPlays(p, type, PLAYS) {
        this.game.players[p].plays[0] = 0;
        for (let key in PLAYS) {
            if (PLAYS.hasOwnProperty(key)) {
               console.log(key, yourobject[key]);
            }
         }
    };


    async playGame() {
        // this.alertBox("You're about to start playing, but there really isn't a lot going on.\nIf you have questions, email me at samulation.dev@gmail.com");
        document.querySelector('.selection.pl1').innerHTML = '';
        document.querySelector('.selection.pl2').innerHTML = '';
        document.querySelector('.page-main h1').innerText = 'Player 1 Pick Play';
        document.querySelector('.page-sidebar h1').innerText = 'Player 2 Pick Play';
        // document.querySelector('.playButton').disabled = true;

        await this.gameLoop(this.game, 0);
    
        console.log(this.game);
    };

    async gameLoop(game, test = 11) {
        game.status = test;
        if (test === 0) {
            game.current_time = -0.5;  // LATER: Remember to check
        }
    
        while (game.status < 900) {
            while (game.current_time >= 0 && game.status != 999) {
                //game.save('as-' + datetime.now().strftime("%m.%d.%Y-%H.%M.%S"))
                if (game.status < 0) {
                    await this.kickoff(game);
    
                } else if (game.status > 10 && game.status < 100 || game.two_point) {
                    await this.playMechanism(game);
                }
    
                if (game.status !== 999) {
                    await this.endPlay(game);
                }
            }
    
            if (game.status < 900) {
                await this.gameCtrl(game);
            }
        }
    
        if (game.status === 999) {
            game.status = 0;
        }
    };

    async kickoff(game) {
        const oNum = game.off_num;
        const dNum = game.def_num;
        game.down = 0;
        game.fst_down = 0;
    
        this.prePlay(game, game.status);  // NOW: Check on this
    
        if (game.status === -4) {
            this.punt(game, oNum, -4);  // Safety Kick
        // Regular old kickoff
        } else {
            // Reset board
            game.spot = 65;
            game.thisPlay.dist = 0;
            // moveBall('s');
            
            await this.kickPage(game, oNum);
    
            if (game.status !== 999) {
                await this.returnPage(game, dNum);
            }
            if (game.status !== 999) {
                this.kickDec(game);
            }
        }
    };

    changePoss(game, mode = '') {
        // Modes explained
        // '' = just change poss
        // 'k' = kick (like a kickoff)
        // 'nop' = no ot poss, just change (but in OT)
        // 'ot' = set up OT
        // 'to' = turnover
        // 'pnt' = punt
        // 'fg' = missed field goal
    
    
        if (mode !== '' && mode !== 'k' && mode !== 'nop') {
            // moveBall('c');  // Which cleared the ball
        }
    
        if (mode !== 'nop' && mode !== 'ot' && game.isOT() && !game.two_point && game.ot_poss > 0) {
            game.ot_poss = -game.ot_poss;  // This indicates that the ot poss just ended, handle appropriately
        }
    
        if (mode ==='to') {
            game.spot = 100 - game.spot;  // Switch side of field
            //addRecap(game, teamName + ' turnover!') // or however
            //game.players[game.off_num].stats.tos++;  // Inc turnovers in Stats
            game.turnover = true;
            game.down = 0;
        } else if (mode === 'ot') {
            // Probably need a visual reset here
            game.spot = 75;
            game.ot_poss = Math.abs(game.ot_poss) - 1;
        } else if (mode === 'pnt') {
            game.spot = 100 - game.spot;  // Switch side of field
        } else if (mode === 'fg') {
            if (!game.isOT()) {
                if (game.spot + 7 <= 20) {  // By an obscure NFL rule, essentially a touchback
                    game.spot = 20;
                } else {  // Take over at spot of kick
                game.spot = 100 - game.spot + 7;
                }
            }
        }
    
        if (mode != '' && mode !== 'k' && mode !== 'nop') {
            // moveBall('s');  // Which showed ball
        }
    
        // This should never happen, but it's making sure the possessions don't equal each other
        // We assume to offensive number is correct
        if (game.off_num === game.def_num) {
            game.def_num = game.opp(game.off_num);
        }
    
        // Actually change possession
        const tmp = game.off_num;
        game.off_num = game.def_num;
        game.def_num = tmp;
        // printNeedle(game.off_num);
    
        if (game.status >= 11 && game.status <= 17 && game.status !== 16) {
            if (mode !== 'ot') {
                // printFirst(game);  // These are the first down markers
            }
            game.fst_down = game.spot + 10;  // CHECK: I think this is needed
            this.updateDown(game);
        }
    };

    async kickPage(game, oNum) {
        // const oName = game.players[oNum].team.name;
        // printDown('KICK');
        // let kckDec = null;
    
        if (game.isReal(oNum)) {
            await this.playPages(game, oNum, 'kick');
        } else {
            this.cpuPages(game, 'kick');
        }
    
        // game.players[oNum].currentPlay = kckDec;
    }
    
    async returnPage(game, dNum, pick = null) {
        // const dName = game.players[dNum].team.name;
    
        if (game.isReal(dNum)) {
            await this.playPages(game, dNum, 'ret', pick);
        } else {
            this.cpuPages(game, 'ret', pick);
        }
    }
    
    kickDec(game, die1 = null, mCoddsdie2 = null, yC = null) {
        const oName = game.players[game.off_num].team.name;
        const dName = game.players[game.def_num].team.name;
        const kickType = game.players[game.off_num].currentPlay;
        const retType = game.players[game.def_num].currentPlay;
        let touchback = false;
        let possession = true;
        let tmp = null;
        let kickDist = 0;
        let mltCard = '';
        let yard = 0;
        let multiplier = -1;
        let retDist = 0;
        let okResult = false;
        // this.alertBox('Teams are lining up for the kick...);
    
        // Testing override
        if (game.test) {

        }

        if (kickType === 'RK') {
            if (retType === 'RR') {
                tmp = Utils.rollDie();
                if (die1) {
                    tmp = die1;
                }
                kickDist = 5 * tmp - 65;
                mltCard = game.decMults().card;
                if (mCoddsdie2) {
                    mltCard = mCoddsdie2;
                }
                yard = game.decYards();
                if (yC) {
                    yard = yC;
                }
    
                if (mltCard === 'King') {
                    multiplier = 10;
                } else if (mltCard === 'Queen') {
                    multiplier = 5;
                } else if (mltCard === 'Jack') {
                    multiplier = 0;
                }
    
                retDist = multiplier * yard;
            // Touchback
            } else {
                touchback = true;
            }
        } else if (kickType === 'OK') {
            this.alertBox(oName + ' onside kick!!!');
            let odds = 6;
            if (retType === 'RK') {
                odds = 12;
            }
    
            tmp = Utils.randInt(1,odds);
            if (mCoddsdie2) {
                tmp = mCoddsdie2;
            }
            okResult = tmp === 1;  // 1 in 'odds' odds of getting OK
            kickDist = -10 - tmp;
            retDist = tmp + Utils.rollDie();
            if (die1) {
                retDist = tmp + die1;
            }
        // Squib Kick
        } else {
            tmp = Utils.rollDie();
            if (die1) {
                tmp = die1;
            }
            kickDist = -15 - 5 * tmp;
            if (retType === 'RR') {
                tmp = Utils.rollDie() + Utils.rollDie();
                if (die1 && mCoddsdie2) {
                    tmp = die1 + mCoddsdie2;
                }
                retDist = tmp;
            } else {
                retDist = 0;
            }
        }
    
        this.alertBox('The kick is up...');
    
        if (touchback) {
            this.alertBox('Deep kick!');
            // moveBall('c');
        } else {
            this.alertBox(oName + ' kicks...');
            game.thisPlay.dist = kickDist;
            // moveBall('k');
            game.spot += kickDist;
        }
    
        if (kickType === 'OK') {
            if (okResult) {
                this.alertBox(oName + ' recovers!');
                possession = false;
                retDist = -retDist;
            } else {
                this.alertBox(dName + ' recovers!');
            }
        }
    
        if (possession) {
            this.changePoss(game, 'k');
        }
    
        let msg = 'The return...\n';
        if (!touchback) {
            if (retDist === 0) {
                msg += 'No return\n';
            } else {
                tmp = game.spot;  // Nec?
            
                if (possession) {
                    msg += dName + ' returns...\n';
                } else {
                    msg += oName + ' returns...\n';
                }
    
                if (game.spot + retDist >= 100) {
                    game.status = 101;
                    // addRecap( kick return TD )
                    retDist = 100 - game.spot;
                } else if (game.spot + retDist <= 0) {
                    game.status = 102;
                    retDist = -game.spot;
                }
    
                game.thisPlay.dist = retDist;
                // moveBall('k');
                game.spot += retDist;
                msg += (retDist > 0 ? '+' : '-') + Math.abs(retDist) + '-yard return!';
            }
        } else {
            msg += 'Touchback...';
            game.spot = 25;
            // moveBall('s');
            // Return Timeout
            if (game.time_change === 4) {
                this.returnTime(last_call_to);
            }
            if (game.two_min) {
                game.two_min = false;
            }
            // LATER: Change to 'tb' or something better
            game.time_change = 1;
        }
        this.alertBox(msg);
    
        if (game.status < 0) {
            game.status = Math.abs(game.status);  // Make status positive (no more kicking)
        }
    };

    async playMechanism(game) {
        let stat, ono, p1, p2;
    
        this.prePlay(game, 11);
        await this.pickPlay(game);
    
        stat = game.status;
        ono = game.off_num;
        p1 = game.players[1].currentPlay;
        p2 = game.players[2].currentPlay;
        // console.log(stat);
        if (stat !== 999) {
            // lastChanceTO(stat, game.qtr, game.current_time, game.time_change);
            this.doPlay(game, stat, ono, p1, p2);
        }
    };
    
    prePlay(game, stat) {
        console.log(game);  // LATER: Suppress this ASAP
        // console.log('prePlay');
        game.thisPlay.multiplier_card = 999;
        game.thisPlay.multiplier_num = 999;
        game.thisPlay.yard_card = 999;
        game.thisPlay.multiplier = 999;
        game.thisPlay.dist = 999;
        game.thisPlay.bonus = 0;
    
        if (!game.two_point || game.time_change !== 4) {
            game.time_change = 0;
        }
    
        if (game.turnover && game.down !== 1) {
            game.down = 1;
        }
    
        game.turnover = false;
    
        game.status = stat;
    
        if ((game.qtr === 2 || game.qtr === 4) && game.current_time === 2) {
            this.two_min_check(game);
        }   
    };
    
    two_min_check(game) {
        let two_min = game.two_minute;
        let tim_chg;
    
        // Two-minute warning just ended
        if (two_min) {
            tim_chg = 0;
            two_min = false;
    
        // Two-minute warning needs to start
        } else {
            tim_chg = 9;
            two_min = true;
            console.log('Two-minute warning...');
        }
    
        game.time_change = tim_chg;
        game.two_minute = two_min;
    };
    
    async pickPlay(game) {
        // console.log('pickPlay');
        for (let p = 1; p <= 2; p++) {
            game.players[p].currentPlay = '';
    
            // Computer Stuff
            if (game.status !== 999 && p === 2 && !game.isReal(2)) {
                // This is where the computer can call timeout or pick special play
                this.alertBox(game.players[2].team.name + ' are picking their play...');
                // # LATER Print that computer is picking play
                if (game.time_change === 0) {
                    this.cpuTime(game);
                }
                
                this.cpuPlay(game);   
            }
    
            while (game.players[p].currentPlay === '' && game.status !== 999) {
                if (game.isReal(p)) {
                    await this.playPages(game, p);
                } else {
                    this.cpuPages(game);  // It used to say 'plrs' for second param investigate
                }
            }
            
        }
    
        // Making sure you didn't exit
        if (game.status !== 999) {
            game.status = this.setStatus(game, game.players[1].currentPlay, game.players[2].currentPlay);
            // debugger
    
            this.alertBox("Both teams are lining up for the snap...");
        
        // Exit out of the game
        } else {
            this.alertBox('Catch ya laterrrrr!');
            // console.log(game);
        }
    };
    
    cpuTime(game) {
        const toCount = game.players[2].timeouts;
        const ono = game.off_num;
    
        if (toCount > 0) {
            const qtr = game.qtr;
            const ctim = game.current_time;
            const spt = game.spot;
            const p1s = game.players[1].score;
            const p2s = game.players[2].score;
            let endHalf = false;
            let lastMin = false;
            let ballBack = false;
            let kick = false;
    
            // End half and losing
            endHalf = ((ono == 2 && qtr == 2 || qtr == 4) && p2s <= p1s && ctim <= 1 && game.down != 4);
    
            // Last minute with fav||able spot
            if (!endHalf) {
                lastMin = ((ono == 1 && spt < 50 || ono == 2 && spt >= 50) && qtr == 2 && ctim <= 1);
            }
            // Chance to get the ball back
            if (!endHalf && !lastMin) {
                ballBack = ((qtr == 2 || qtr ==4) && ctim == 0 && ono == 1 && game.players[1].timeouts == 0 && game.down == 4);
            }
            // Timeout on kickoff
            if (!endHalf && !lastMin && !ballBack) {
                kick = (qtr == 4 && ctim <= .5 && game.status == -3 && p2s < p1s);
            }
            if (endHalf || lastMin || ballBack || kick) {
                game.callTime(2);
                // print_timeout()
            }
        }
    };
    
    timeout(game, p) {
        const tChg = game.time_change;
        const toCount = game.players[p].timeouts;
        let msg = '';
    
        // 9 = Two-min call
        if (tChg === 9) {
            msg = 'Timeout not called, two minute warning...';
        } else if (game.two_point) {
            msg = 'Timeout not called, two-point conversion...';
        // 4 = Timeout called
        } else if (tChg !== 4) {
            // Call timeout
            if (toCount > 0) {
                game.callTime(p);
                game.last_call_to = p;
                game.time_change = 4;
                msg = 'Timeout called by ' + game.players[p].team.name;
                // LATER: Print timeout change
            // No timeouts left
            } else {
                msg = 'Timeout not called, no timeouts...';
            }
        } else {
            msg = "Timeout not called, one's been called...";
        }
    
        this.alertBox(msg);
    };
    
    cpuPlay(game) {
        if (game.off_num === 2) {
            const qtr = game.qtr;
            const curtim = game.current_time;
            const toCount = game.players[2].timeouts;
            const tchg = game.time_change;
            const qlen = game.qtr_length;
            const spt = game.spot;
            const hm = game.players[2].hm;
            const dwn = game.down;
            const fdn = game.fst_down;
            const diff = game.players[1].score - game.players[2].score;
            let scoreBlock = 0;
            let timeBlock = 0;
            let dec = null;
    
            // Time block
            if (curtim === 0 && (qtr === 2 || qtr === 4) && toCount === 0 && tchg !== 4) {
                timeBlock = 1;  // Last play
            } else if (curtim <= 0.5 && qtr === 4) {
                timeBlock = 2;  // Late game
            } else if (qlen <= 2 && qtr >= 3 && qtr <= 4 || curtim <= 4 && qtr === 4) {
                timeBlock = 3;  // Some left
            } else if (qlen <= 4 && qtr >= 3 && qtr <= 4 || curtim <= 8 && qtr === 4) {
                timeBlock = 4;  // Lots left
            }
    
            // Score Block
            if (diff >= 1) {
                if (diff <= 3) {
                    scoreBlock = 1;  // Down a FG
                } else if (diff <= 8) {
                    scoreBlock = 2;  // Down a possession
                } else if (diff <= 11) {
                    scoreBlock = 3;  // Down a poss + FG
                } else {
                    scoreBlock = 4;  // Down 2+ TDs
                }
            }
    
            // Put it all together
            // Half over, kick a FG
            if (spt >= 60 && (timeBlock === 1 && qtr ===2 || scoreBlock === 0 && timeBlock === 1 && qtr === 4)) {
                dec = 'FG';
            }
    
            // Hail mary
            if (!dec && hm && (timeBlock === 1 && scoreBlock > 1 || timeBlock === 2 && scoreBlock === 1 && spt < 70 || timeBlock === 2 && scoreBlock > 1)) {
                dec = 'HM';
            }
    
            // Gotta go for it
            if (!dec && timeBlock === 1 && scoreBlock === 1) {
                if (spt >= 60) {
                    dec = 'FG';  // To win or tie
                } else if (hm) {
                    dec = 'HM';
                }
            }
    
            // OT go for it
            if (!dec && qtr > 4 && scoreBlock === 2 && dwn === 4) {
                if (hm && fdn - spt > 10) {
                    dec = 'HM';
                } else {
                    dec = 'GO';  // Cuz there are no punts
                }
            }
    
            // 4th down, dire
            if (!dec && dwn === 4 && (timeBlock >= 1 && timeBlock <= 2 && scoreBlock === 1 || timeBlock >= 3 && scoreBlock === 3)) {
                if (spt >= 60){
                    dec = 'FG';
                } else {
                    if (hm && fdn - spt > 10) {
                        dec = 'HM';
                    } else {
                        dec = 'GO';
                    }
                }
            }
    
            // 4th down, go
            if (!dec && dwn === 4 && (timeBlock === 3 && scoreBlock >= 1 && scoreBlock <=4 || timeBlock === 4 && scoreBlock === 4)) {
                if (hm && fdn - spt > 10) {
                    dec = 'HM';
                } else {
                    dec = 'GO';
                }
            }
    
            // 4th down, regular choices
            if (!dec && dwn === 4) {
                if (Utils.coinFlip() && (spt >= 98 || spt >= 50 && spt <= 70) && fdn - spt <= 3) {
                    dec = 'GO';
                }
    
                // Not going for it, so...
                if (!dec) {
                    if (spt >= 60) {
                        dec = 'FG';
                    } else {
                        dec = 'PT';
                    }
                }
            }
        
            // Set the play
            if (!(!dec || dec === 'GO' || game.two_point)) {
                game.players[2].currentPlay = dec;
            }    
        }
    };
    
    cpuPages(game, state = 'reg', pick = null) {
        if (state === 'reg') {
            let total = 0;
            let play = -1;
        
            while (total === 0) {
                play = Utils.randInt(0, 4);
                
                // Make it harder to pick Trick Play
                if (play === 4) {
                    play = Utils.randInt(0, 4);
                }
        
                total = game.players[2].plays[play];
            }
        
            // console.log("SRLRSPLPTP".substring(2 * play, 2 * play + 2));
            game.players[2].currentPlay = "SRLRSPLPTP".substring(2 * play, 2 * play + 2);
        } else if (state === 'xp') {
            this.alertBox(game.players[2].team.name + ' selecting PAT type...\n');
            let selection = 'XP';
    
            const diff = game.players[1].score - game.players[2].score;
    
            if (diff === -5 || diff === -1 || diff === 2 || diff === 5 || diff === 9 || diff === 10 || diff === 13 || diff === 17 || diff === 18) {
                selection = '2P';
            }
    
            game.players[2].currentPlay = selection;
        } else if (state === 'kick') {
            this.alertBox(game.players[2].team.name + ' selecting kickoff type...');
            this.cpuTime(game);
            
            const qtr = game.qtr;
            const ctim = game.current_time;
            const p2s = game.players[2].score;
            const p1s = game.players[1].score;
            let kckDec = 'RK';
    
            if ((qtr === 4 && ctim <=3 && p2s < p1s) || ((qtr === 3 && ctim <=7 || qtr === 4) && p1s - p2s > 8)) {
                kckDec = 'OK';
            } else if ((qtr === 2 || qtr === 4) && ctim <= 1 && p2s > p1s) {
                kckDec = 'SK';
            }
    
            game.players[2].currentPlay = kckDec;
        } else if (state === 'ret') {
            this.alertBox(game.players[2].team.name + ' selecting return type...');
            this.cpuTime(game);
            
            const qtr = game.qtr;
            const ctim = game.current_time;
            const p2s = game.players[2].score;
            const p1s = game.players[1].score;
            let retDec = 'RR';
    
            // Very late game and P1 losing -OR- later game and P1 losing badly
            if ((qtr === 4 && ctim <= 3 && p1s < p2s) || ((qtr === 3 && ctim <=7 || qtr === 4) && p2s - p1s > 8)) {
                retDec = 'OR';
            } else if (Utils.coinFlip()) {
                retDec = 'TB';
            }
    
            game.players[2].currentPlay = retDec;
        }

        if (pick) {
            game.players[2].currentPlay = pick;
        }
    
    };
    
    async waitForSelection(game, test, state) {
        // if (pick) {
        //     selection = pick;
        // }
        let selection;
        if (game.buttonPressed) {
            selection = await game.buttonPressed;
            if (selection !== 'EXIT') {
                selection = selection.toUpperCase();
                errorMsg = this.playValid(game, p, selection);
                if (errorMsg) {
                    this.alertBox(errorMsg);
                    selection = null;
                }
            } 
        }

    }

    async playPages(game, p, state = 'reg', pick = null) {
        let selection = null;
        let options = 'SRLRSPLPTPHMFGPT';
        // LATER: Use status to change validity based on play type
        if (state === 'xp') {
            options = 'XP2P';
        } else if (state === 'kick') {
            options = 'RKSKOK';
        } else if (state === 'ret') {
            options = 'RRORTB';
        }

        // this.makeButtons(options, p);
    
        // Get message to display
        const msg = this.loadPlay(p, state);
        // const options = loadPlay(state);  // LATER
        let errorMsg = null;
        
        selection = await this.input.getText(game, p, msg, state);

        // Get user input
        // do {
            // selection = this.input.getText(game, options, 'Put abbreviation here (e.g., "sr" for Short Run)');
            // debugger
        
            // selection = await this.waitForSelection(game, p, options, state);
            // if (pick) {
            //     selection = pick;
            // }
            // if (selection !== 'EXIT') {
            //     selection = selection.toUpperCase();
            //     errorMsg = this.playValid(game, p, selection);
            //     if (errorMsg) {
            //         this.alertBox(errorMsg);
            //         selection = null;
            //     }
            // } // else {
                // selection = confirm('Are you sure you want to exit?');
            // if (selection === 'EXIT') {
                // selection = 'EXIT';
                // game.status = 999;
            // } // else {
            //     selection = null;
            // }
            // }
            // console.log(selection);
            // console.log(selection);
        // } while (!options.includes(selection) && game.status !== 999);
        // console.log(selection);



        game.players[p].currentPlay = selection;
        // debugger
    };
    
    playValid(game, p, sel) {
        // console.log('playValid');
        let msg = null;
        const num = "SR,LR,SP,LP,TP,HM,FG,PT".indexOf(sel) / 3;
        // console.log(num);
        let tot = 0;
    
        if (sel === 'FG' || sel === 'PT') {
            tot = -1;
        } else if (sel === 'HM') {
            tot = game.players[p].hm;
        } else if (num !== -1) {
            tot = game.players[p].plays[num];
        }
    
        // console.log(tot);
    
        if (num >= 0 && num <= 5) {  // LATER: Check hail mary
            if (tot === 0) {
                msg = 'No more ' + sel + ' left!';
            }
        }
    
        if (!msg && num === -1) {
            msg = 'Illegal play!';
        }
    
        if (!msg && num >= 5 && num <= 7 && game.def_num === p) {
            msg = ((num === 7) ? "PUNT" : sel) + ' not allowed on defense!';
        }
    
        if (!msg && sel === 'FG' && game.spot < 30) {
            msg = 'Way too far to kick a FG!';
        }
    
        if (!msg && sel === 'PT' && game.down !== 4) {
            msg = 'Punt only allowed on 4th down!';
        }
    
        if (!msg && sel === 'PT' && game.isOT()) {
            msg = "You can't punt in overtime!";
        }
    
        if (!msg && tot === -1 && game.two_point) {
            msg = 'Kicks are not allowed during 2-point!';
        }
    
        return msg;
    };
    
    loadPlay(p, state = 'reg') {
        let options = game.players[1].team.abrv + ' ' + game.players[1].score + " | " + game.players[2].team.abrv + ' ' + game.players[2].score + '\n';
        // LATER: This will be vastly different in a graphical world
        if (state === 'reg') {
            options += game.down + this.ending(game.down) + ' & ' + this.downDist(game.fst_down, game.spot) + ' | ' + this.printTime(game.current_time) + ' | Ball on: ' + this.printSpot(game, game.spot) + '\n';
            options += game.players[p].team.name + ' pick your play:\n[SR] Short Run   [LR] Long Run   [SP] Short Pass\n[LP] Long Pass   [TP] Trick Play   [HM] Hail Mary\n[FG] Field Goal   [PT] Punt\n';
        } else if (state === 'xp') {
            options += game.players[p].team.name + ' pick your play:\n[XP] Extra Point\n[2P] Two Point Conversion\n';
        } else if (state === 'kick') {
            options += game.players[p].team.name + ' pick your play:\n[RK] Regular Kick\n[SK] Squib Kick\n[OK] Onside Kick\n';
        } else if (state === 'ret') {
            options += game.players[p].team.name + ' pick your play:\n[RR] Regular Return\n[OR] Onside Return\n[TB] Touchback\n';
        }
    
        return options;
    };

    showBoard() {
        let text = (game.off_num === 1 ? '> ' : '') + game.players[1].team.abrv + ' ' + game.players[1].score + " | " + game.players[2].team.abrv + ' ' + game.players[2].score + (game.off_num === 2 ? ' <' : '') + '\n';
        text += game.down + this.ending(game.down) + ' & ' + this.downDist(game.fst_down, game.spot) + ' | ' + game.qtr + this.ending(game.qtr) + ' | ' + this.printTime(game.current_time) + ' | Ball on: ' + this.printSpot(game, game.spot) + '\n';
        return text;
    }
    
    ending(num) {
        let ending = 'th';
    
        if (num === 1) {
            ending = 'st';
        } else if (num === 2) {
            ending = 'nd';
        } else if (num === 3) {
            ending = 'rd';
        }
    
        return ending;
    };
    
    downDist(f, s) {
        let ending = f - s;
    
        if (f === 100) {
            ending = 'G';
        } else if (f === s) {
            ending = 'IN';
        }
    
        return ending;
    };
    
    printTime(time) {
        const min = Math.trunc(time);
        const sec = (time - min === 0.5) ? '30' : '00';
        // HW: How would you do other times?
    
        return min + ':' + sec;
    };
    
    printSpot(game, s) {
        let spot = '50';
        // console.log(game.off_num);
        // console.log(game.players[1].team.abrv);
        // console.log(game.players[game.off_num].team.abrv);
        if (s < 50) {
            spot = game.players[game.off_num].team.abrv + ' ' + s;
        } else if (s > 50) {
            spot = game.players[game.def_num].team.abrv + ' ' + (100 - s);
        }
    
        return spot;
    };
    
    setStatus(game, p1, p2) {
        let stat = 0;
        let ono = game.off_num;
    
        if ("SRLRSPLP".includes(p1) && "SRLRSPLP".includes(p2)) {
            stat = 11;
        }
    
        if (!stat) {
            if (p1 === 'HM' || p2 === 'HM') {
                stat = 17;
            } else if (p1 === 'FG' || p2 === 'FG') {
                stat = 15;
            } else if (p1 === 'PT' || p2 === 'PT') {
                stat = 16;
            }
        }
    
        if (!stat) {
            if (p1 === 'TP') {
                stat = ono === 1 ? 12 : 13;
            } else if (p2 === 'TP') {
                stat = ono === 1 ? 13 : 12;
            } else {
                stat = 11;
            }
        }
    
        return stat;
    };
    
    doPlay(game, stat, ono, p1, p2) {
        // rplcpic boardtop
        // console.log('doPlay');
    
        if (stat >= 11 && stat <= 13) {
            this.regPlay(game, p1, p2);        
        }
    
        stat = game.status;
    
        if (stat === 14) {
            this.samePlay(game);        
        } else if (stat >= 12 && stat <= 13) {
            this.trickPlay(game);
        } else if (stat === 15) {
            this.fieldGoal(game, ono);
        } else if (stat === 16) {
            this.punt(game, ono, 16);
        } else if (stat === 17) {
            this.hailMary(game);
        }
    };
    
    regPlay(game, pl1, pl2) {
        // hno = game.home;  // Used for scoreboard updating
        // let report = 'Here are the plays...\n' + pl1 + ' vs. ' + pl2;
    
        this.drawPlay(game, 1, pl1);
        this.drawPlay(game, 2, pl2);
    
        // If both players picked the same play, 50/50 chance of Same Play Mechanism
        if (pl1 === pl2) {
            if (pl1 === 'TP' || Utils.coinFlip()) {
                // 14 = Same Play
                game.status = 14;
            }
        }
    
        // this.alertBox(report);
    };
    
    drawPlay(game, plr, play) {
        // console.log('drawPlay');
        // const cardNum = "SRLRSPLPTPHM".indexOf(play) / 2;
        // game.players[plr].decPlays(cardNum);
        game.players[plr].decPlays(play);
        // console.log(game.players[plr].plays);
    };
    
    samePlay(game) {
        const coin = Utils.coinFlip();
        let multCard = null;
    
        this.alertBox('Same play!');
        multCard = game.decMults();
    
        if (multCard.card === 'King') {
            this.bigPlay(game, coin ? game.off_num : game.def_num);
        } else if (multCard.card === 'Queen' && coin || multCard.card === 'Jack' && !coin) {
            game.thisPlay.multiplier = 3;
        } else if (multCard.card === 'Queen' && !coin || multCard.card === 'Jack' && coin) {
            game.thisPlay.multiplier = -3;
        } else {
            if (coin) {
                this.alertBox('Picked!');
                this.changePoss(game, 'to');
            }
            game.thisPlay.dist = 0;
            game.thisPlay.yard_card = '/';
        }
    };
    
    returnTime(last) {
        game.players[last].timeouts++;
        console.log('Timeout returned to ' + game.players[last].team.name + '...');
        // LATER: Graphically show timeout returning on scoreboard
    }
    
    bigPlay(game, num) {
        const die = Utils.rollDie();
    
        // Offensive Big Play
        if (game.off_num === num) {
            if (die >= 1 && die <=3) {
                game.thisPlay.dist = 25;
            } else if (die === 6) {
                game.thisPlay.dist = 101;  // Touchdown
            } else {  // die === 4 && die === 5
                if ((100 - game.spot) / 2 > 40) {  // Half the field or 40, whichever is more
                    game.thisPlay.dist = Math.round((100 - game.spot) / 2);
                } else {
                    game.thisPlay.dist = 40;
                }
            }
        // Defense
        } else {
            if (die >= 1 && die <=3) {
                // If timeout called, return
                if (game.time_change === 4) {
                    this.returnTime(game.last_call_to);
                }
    
                game.time_change = 2;
    
                if (game.spot - 10 < 1) {
                    game.thisPlay.dist = -Math.trunc(game.spot / 2);  // Half the distance to the goal
                } else {
                    game.thisPlay.dist = -10;  // 10-yard penalty on off
                }
            } else {
                if (die === 6) {
                    this.alertBox('FUMBLE!!!');
                    game.thisPlay.dist = 101;  // Touchdown
                } else {  // die === 4 && die === 5
                    this.alertBox('FUMBLE!!');
                    if ((100 - game.spot) / 2 > 25) {  // Half the field or 25, whichever is more
                        game.thisPlay.dist = Math.round((100 - game.spot) / 2);
                    } else {
                        game.thisPlay.dist = 25;
                    }
                }
                this.changePoss(game, 'to');
            }
        }
    
        // Prevent calculations
        game.thisPlay.multiplier_card = '/';
        game.thisPlay.yard_card = '/';
        game.thisPlay.multiplier = '/';
    }
    
    trickPlay(game) {
        const die = Utils.rollDie();
        this.alertBox((game.status === 12 ? game.players[game.off_num].team.name : game.players[game.def_num].team.name) + ' trick play!');
    
        if (die === 2) {
            // If timeout called, return
            if (game.time_change === 4) {
                this.returnTime(game.last_call_to);
            }
            game.time_change = 2;
    
            // Offense Trick Play
            if (game.status === 12) {
                if (game.spot + 15 > 99) {
                    game.thisPlay.dist = Math.trunc((100 - game.spot) / 2);  // Half the distance to the goal
                } else {
                    game.thisPlay.dist = 15;  // 15-yard penalty on def
                }
            // Defense
            } else {
                if (game.spot - 15 < 1) {
                    game.thisPlay.dist = -Math.trunc(game.spot / 2);  // Half the distance to the goal
                } else {
                    game.thisPlay.dist = -15;  // 15-yard penalty on off
                }
            }
    
            // Prevent calcuations
            game.thisPlay.multiplier_card = '/';
            game.thisPlay.yard_card = '/';
        } else if (die === 3) {
            game.thisPlay.multiplier_card = '/';
            game.thisPlay.multiplier = -3;
        } else if (die === 4) {
            game.thisPlay.multiplier_card = '/';
            game.thisPlay.multiplier = 4;
        } else if (die === 5) {
            this.bigPlay(game, game.status === 12 ? game.off_num : game.def_num);
        // die === 1 && die === 6
        } else {
            if (game.status === 12) {
                game.thisPlay.bonus = 5;
            } else {
                game.thisPlay.bonus = -5;
            }
    
            // Place play based on die roll
            game.players[(game.status === 12 ? game.off_num : game.def_num)].currentPlay = die === 1 ? 'LP' : 'LR';
        }
    };
    
    fieldGoal(game, ono) {
        const name = game.players[game.off_num].team.name;
        let make = true;
        let spt = 100 - game.spot;
        let fdst = spt + 17;
        const die = Utils.rollDie();
        
        this.alertBox(name + ' attempting a ' + fdst + '-yard field goal...');
        
        // Ice kicker
        if (game.time_change === 4 && game.last_call_to !== game.off_num) {
          die++;
         console.log('Kicker iced!');
        }
    
        if (fdst > 65) {
            const tmp = Utils.randInt(1, 1000);
            make = tmp === fdst;  // 1 in 1000 chance you get fdst
        } else if ((fdst >= 60 && die < 6) || (fdst >= 50 && die < 5) || (fdst >= 40 && die < 4) || (fdst >= 30 && die < 3) || (fdst >= 20 && die < 2)) {
            make = false;
        }
    
        // LATER: Field goal graphics will go here
    
        if (make) {
            this.alertBox(name + ' field goal is good!');
            this.scoreChange(game, ono, 3);
            if (game.isOT()) {
                // Maybe the graphics are different here
            } else {
                game.status = -3;
            }
        } else {
            this.alertBox(name + ' field goal is no good...');
            if (!game.isOT()) {
                this.changePoss(game, 'fg');
            }
        }
    
        // LATER: addRecap()
        // addRecap(..., fdst + '-yd FG ' + (make ? 'good' : 'missed'));
    
        if (game.isOT()) {
            game.ot_poss = -Math.abs(game.ot_poss);
        }
    };
    
    punt(game, ono, stat) {
        const oName = game.players[game.off_num].team.name;
        const dName = game.players[game.def_num].team.name;
        let block = false;
        let touchback = false;
        let possession = true;
        let kickDist = 0;
        let retDist = 0;
    
        // Safety Kick
        if (game.status === -4) {
            // Probably reset graphics
            game.spot = 35;
            // moveBall('s');
        // Punt
        } else {
            // Add Recap for punt, maybe remove first down sticks
        }
    
        // printDown('PUNT');
        this.alertBox(oName + (game.status === -4 ? ' safety kick' : ' are punting') + '...');
    
        // Check block (not on Safety Kick)
        if (game.status !== -4 && Utils.rollDie() === 6) {
            if (Utils.rollDie() === 6) {  // 1 in 36 chance, must roll TWO sixes in a row
                block = true;
            }
        }
    
        // Get yard card
        if (!block) {
            // Yard card times 10 and, if heads, add 20
            kickDist = 10 * game.decYards() / 2 + 20 * Utils.coinFlip();
            
            // Check for touchbacks
            if (game.spot + kickDist > 100) {
                touchback = true;
            }
        }
    
        this.alertBox('The punt is up...');
    
        if (touchback) {
            this.alertBox('Deep kick!');
            // moveBall('c');
        } else if (block) {
            this.alertBox(dName + ' blocked the punt!!!');
            // addRecap( blocked punt )
        // Regular punt/safety kick 
        } else {
            game.thisPlay.dist = kickDist;
            // moveBall('k');
        }
    
        game.spot += kickDist;
    
        // Check muff, but not on safety kick
        if (!touchback && !block && game.status !== -4 && Utils.rollDie() === 6) {
            if (Utils.rollDie() === 6) {
                possession = false;
            }
        }
    
        if (possession) {
            if (touchback) {
                this.changePoss(game, 'k');
            } else {
                this.changePoss(game, 'pnt');
            }
        } else {
            this.alertBox(dName + ' muffed the kick!\n' + oName + ' recovers the ball...');
            // addRecap( muffed punt )
            // record turnover to def_num
        }
    
        // Return
        let msg = 'The return:\n';

        if (possession && !touchback && !block) {
            const mltCard = game.decMults().card;
            const yrd = game.decYards();
            let mlt = -0.5;
    
            if (mltCard === 'King') {
                mlt = 7;
            } else if (mltCard === 'Queen') {
                mlt = 4;
            } else if (mltCard === 'Jack') {
                mlt = 1;
            }
    
            retDist = Math.round(mlt * yrd);
    
            if (retDist === 0) {
                msg += 'No return.';
            } else {
                if (game.spot + retDist >= 100) {
                    game.status = 101;
                    // addRecap( punt ret TD )
                    retDist = 100 - game.spot;
                } else if (game.spot + retDist <= 0) {
                    game.status = 102;
                    // addRecap( punt ret safety )
                    retDist = -game.spot;
                }
    
                game.thisPlay.dist = retDist;
                // moveBall('k');
                game.spot += retDist;
    
                msg += dName + ' returns for ' + retDist + ' yards.';
            }
        } else if (touchback) {
            msg += dName + ' takes a touchback...';
            game.spot = 20;
            // moveBall('s')  // Maybe
        }
    
        // If you didn't score, post-punt
        if (game.status === -4 || game.status === 16) {
            game.status = 6;
            game.down = 0;  // CHECK: This is a band-aid
        }

        this.alertBox(msg);
    };
    
    hailMary(game) {
        const die = Utils.rollDie();
        let msg = null;
        let dst = 0;
    
        this.alertBox(game.players[game.off_num].team.name + ' hail mary!');
    
        if (die === 1) {
            msg = 'BIG SACK!';
            dst = -10;
        } else if (die === 2) {
            dst = 20;
        } else if (die === 3) {
            dst = 0;
        } else if (die === 4) {
            dst = 40;
        } else if (die === 5) {
            msg = 'PICKED!';
            this.changePoss(game, 'to');
        } else {
            dst = 101;
        }
    
        if (msg) {
            this.alertBox(msg);
        }
    
        game.thisPlay.multiplier_card = '/';
        game.thisPlay.yard_card = '/';
        game.thisPlay.multiplier = '/';
        game.thisPlay.dist = dst;
    
        game.players[game.off_num].hm--;
    };

    
    // END OF PLAY - WE HAVE THE DATA, LET'S GO!!!
    async endPlay(game) {
        const p1 = game.players[1].currentPlay;
        const p2 = game.players[2].currentPlay;

        if ((game.status > 10 && game.status <= 14) || game.status === 17) {
            this.calcDist(game, p1, p2);

            console.log('Play over - ball is moving...');
            this.reportPlay(game, p1, p2);

            // if (!game.two_point && game.status < 15 || game.status > 16) {
            //     saveDist(game.off_num)  // LATER: When we have stats
            // }

            if (game.two_point) {
                game.spot = game.thisPlay.dist + game.spot;
            }
        }

            await this.checkScore(game, game.thisPlay.bonus, game.thisPlay.dist);

            console.log('Updating scoreboard...');
            if (!game.isOT() && game.ot_poss < 0 && !game.two_point && game.status < 15 || game.status == 17) {
                this.updateDown(game);
            }

            if (!game.two_point) {
                this.timeChange(game);
            }

            // this.alertBox('Teams huddling up...\nPress Enter...\n');

            if (game.status > 0 && game.status < 10) {
                game.status = 11;
            }
            console.log(game.status);
    // }
    };

    calcDist(game, p1, p2) {
        console.log('Drawing cards...');

        if (game.thisPlay.multiplier_card === 999) {
            game.thisPlay.multiplier_card = game.decMults();
        }

        if (game.thisPlay.yard_card === 999) {
            game.thisPlay.yard_card = game.decYards();
        }

        if (game.thisPlay.multiplier === 999 && game.thisPlay.multiplier_card === '/') {
            game.thisPlay.multiplier = '/';
        } else if (game.thisPlay.multiplier_card !== '/') {
            game.thisPlay.multiplier = this.calcTimes(game, p1, p2, game.thisPlay.multiplier_card.num);
        }

        if (game.thisPlay.dist === 999) {
            game.thisPlay.dist = Math.round(game.thisPlay.yard_card * game.thisPlay.multiplier) + game.thisPlay.bonus;
        }

        // Test TDs
        // game.spot = 1000;

        // Check for touchdowns
        if (game.spot + game.thisPlay.dist >= 100) {
            game.thisPlay.bonus = game.thisPlay.dist;
            game.thisPlay.dist = 100 - game.spot;
            if (!game.two_point) {
                game.status = 101;
            }
        }

        // Check for safeties
        if (game.spot + game.thisPlay.dist <= 0) {
            game.thisPlay.bonus = game.thisPlay.dist;
            game.thisPlay.dist = -game.spot;
            if (!game.two_point) {
                game.status = 102;
            }
        }
    };

    calcTimes(game, p1, p2, multIdx) {
        let p1Num = 'SRLRSPLPTP'.indexOf(p1) / 2;
        let p2Num = 'SRLRSPLPTP'.indexOf(p2) / 2;
        let match = 0;

        if (p1Num === 4 || p2Num === 4) {
            match = 1;
        } else {
            match = MATCHUP[game.off_num === 1 ? p1Num : p2Num][game.off_num === 1 ? p2Num : p1Num];
        }

        return MULTI[multIdx - 1][match - 1];
    };

    reportPlay(game, p1, p2) {
        const times = game.thisPlay.multiplier === 999 ? '/' : null;
        const mCard = game.thisPlay.multiplier_card === '/' ? '/' : game.thisPlay.multiplier_card.card;

        this.alertBox('Player 1: ' + p1 + ' vs. Player 2: ' + p2 + '\nMultiplier Card: ' + mCard + '\nYard Card: ' + game.thisPlay.yard_card + '\nMultiplier: ' + (times ? times : game.thisPlay.multiplier) + 'X\nDistance: ' + game.thisPlay.dist + ' yard' + (game.thisPlay.dist !== 1 ? 's' : '') + '\nTeams are huddling up.');  // Press Enter...\n');
        // alert('Player 1: ' + p1 + ' vs. Player 2: ' + p2 + '\nMultiplier Card: ' + mCard + '\nYard Card: ' + game.thisPlay.yard_card + '\nMultiplier: ' + (times ? times : game.thisPlay.multiplier) + 'X\nDistance: ' + game.thisPlay.dist + ' yard' + (game.thisPlay.dist !== 1 ? 's' : '') + '\nTeams are huddling up. Press Enter...\n');
    };

    async checkScore(game, bon, dst) {
        const ono = game.off_num;
        const dno = game.def_num;
        const oname = game.players[ono].team.name;
        const dname = game.players[dno].team.name;
        let good = false;
        let coin;

        // Two-Point Conversion
        if (game.two_point) {
            if (game.spot + game.thisPlay.dist >= 100 && !game.turnover) {
                if (bon > dst) {
                    good = true;
                } else if (bon === dst) {
                    coin = Utils.coinFlip();

                    if (coin) {
                        good = true;
                    }
                }

                if (good) {
                    this.alertBox(oname + ' 2-point conversion good!');
                    this.scoreChange(game, ono, 2);
                } else {
                    if (game.time_change < 2 || game.time_change > 3) {
                        this.alertBox(oname + ' 2-point conversion no good!');
                    }
                }
            } else if (game.spot + dst <= 0 || game.spot + dst >= 100 && game.turnover) {
                // dno = ono;
                // dname = oname;

                this.alertBox(dname + ' returned 2-pt!!!');
                this.scoreChange(game, dno, 2);
            } else {
                if (game.time_change < 2 || game.time_change > 3) {
                    this.alertBox(oname + ' 2-point conversion no good!');
                }
            }

            if (game.time_change < 2 || game.time_change > 3) {
                game.two_point = false;
                if (!game.isOT()) {
                    game.status = -3;
                } else {
                    game.status = 11;
                }
            }
        }

        if (game.status === 101) {
            await this.touchdown(game);
            // this.alertBox('Congrats!\n\nYou scored a touchdown and broke the game. Come back later for more gameplay...\n');
            //game.status = 101;
        }
        
        if (game.status === 102) {
            this.safety(game);
            // this.alertBox('Congrats!\n\nYou scored a safety and broke the game. Come back later for more gameplay...\n');
            //game.status = 102;
        }
    };

    scoreChange(game, scrNo, pts) {
        // This is going to include a lot of action
        // that will update the scoreboard

        // All that's needed for logic
        game.players[scrNo].score += pts;

        // Also add to the stats at this point
        // Add to the quarter score for the game recap
    };

    safety(game) {
        this.alertBox(game.players[game.def_num].team.name + ' forced a safety!!');
        this.scoreChange(game, game.def_num, 2);
        if (game.isOT()) {
            game.ot_poss = 0;
        } else {
            game.status = -4;
        }
        // addRecap( safety )
    };

    async touchdown(game) {
        this.alertBox(game.players[game.off_num].team.name + ' scored a touchdown!!!');
        this.scoreChange(game, game.off_num, 6);

        // addRecap ( touchdown )
        // debugger
        if (this.patNec(game)) {
            await this.pat(game);
        }

        if (game.isOT()) {
            game.ot_poss = -game.ot_poss;
        }
    };

    // QUESTION FOR DANIEL
    patNec(game) {
        const endGameNoTO = game.qtr === 4 && game.current_time === 0 && game.time_change !== 4;
        const endOT = game.isOT() && (game.ot_poss === 1 || (game.ot_poss === 2 && game.turnover));
        const scoreDiff = game.players[game.off_num].score > game.players[game.def_num].score || game.players[game.def_num].score - game.players[game.off_num].score > 2;

        return !((endGameNoTO || endOT) && scoreDiff);
        // return !(endGameNoTO || endOT) || !scoreDiff;
        // return !endGameNoTO && !endOT || !scoreDiff;
    };

    async pat(game) {
        const oNum = game.off_num;
        const oName = game.players[oNum].team.name;
        let selection = '2P';  // Default in 3OT+

        if (game.qtr < 7) {  // Must go for 2 in 3OT+
            if (game.isReal(oNum)) {
                await this.playPages(game, oNum, 'pat');
            } else {
                this.cpuPages(game, 'xp');
            }

            selection = game.players[oNum].currentPlay;
        }

        if (selection == '2P') {
            // printDown('2PT');
            game.spot = 98;
            // moveBall('s');
            if (game.time_change !== 4) {
                game.time_change = 7;  // Two-point
            }
            game.two_point = true;
        } else {
            // printDown('XP');
            const die = Utils.rollDie();
            // printFG(die !== 6);

            if (die !== 6) {
                this.alertBox(oName + ' XP good!');
                this.scoreChange(game, oNum, 1);
            } else {
                this.alertBox(oName + ' XP no good...');
                // Might need some graphics here
            }

            // addRecap( xp [no] good );

            if (!game.isOT()) {
                game.status = -3;  // Get ready for kickoff
            } else {
                game.status = 11;  // Get ready for next OT play
            }
        }
    };

    updateDown(game) {
        let coin;

        if (game.down !== 0) {
            console.log('Update down: ' + game.spot);
            game.spot += game.thisPlay.dist;
            console.log(game.spot);
        }

        // if (game.spt != 0 || game.status > 0 && game.status < 10) { // Update the spot }

        // Sticks
        if (game.spot === game.fst_down) {
            this.alertBox('Sticks...');
            coin = Utils.coinFlip();

            if (!coin) {
                this.alertBox('Almost!');
            }
        }

        if (game.down === 0) {
            coin = 1;
        }

        if (game.spot > game.fst_down || coin) {
            if (game.down !== 0) {
                this.alertBox('First down!');
                // print_down(game);
            }
            game.down = 1;

            if (game.spot > 90) {
                game.fst_down = 100;
            } else {
                game.fst_down = game.spot + 10;
            }

            // print_down(game);
            // document.querySelector('.page-subheader').innerText = this.showBoard();

            if (game.status > 10) {
                // LATER: Inc player's first downs here
            }

            coin = 1;
        }

        if (!coin && game.time_change !== 2) {
            game.down += 1;
        }

        if (game.down > 4) {
            this.alertBox('Turnover on downs!!!');
            this.changePoss(game, 'to');

            game.down = 1;
        }

        // print_down(game);
        document.querySelector('.page-selection2').innerText = this.showBoard();
    };

    timeChange(game) {
        console.log('timeChange');
        if (game.qtr <= 4 && game.time_change === 0) {
            game.current_time -= 0.5;
            console.log(game.current_time);
            // Inc TOP for offense
            // print_time(game.current_time);
        }

        // LATER: Add this for OT
        // if (game.ot_poss < 0) {
        //     if (game.isOT() && game.ot_poss_switch(qtr, ono, rec_first, ot_poss)) {
        //         changePoss(game, 'ot');
        //     } else {
        //         this.ot_poss_switch2()
        //         game.ot_poss = Math.abs(game.ot_poss) - 1;
        //     }
        // }

        if (game.qtr > 4 && game.ot_poss === 0) {
            game.current_time = -0.5;
        }
        document.querySelector('.page-selection2').innerText = this.showBoard();
    };

    async gameCtrl(game) {
        if (game.status === 0) {
            await this.coinToss(game);

            if (!game.isOT() || game.game_type === 'otc') {
                this.resetVar(game);
            }
        } else {
            // End of half
            if (game.status === 0 || (!(game.qtr % 2))) {
                this.resetVar(game);
            }

            // End of odd quarter (1st, 3rd, OT)
            if (game.qtr % 2 && game.current_time !== game.qtr_length) {
                this.resetTime(game);  // CHECK: This was a band-aid
            }
        }

        if (game.status < 900) {
            // Set up OT Challenge
            if (game.qtr === 5 && game.game_type === 'otc' && game.rec_first != game.off_num) {
                this.changePoss(game);
                // print_needle(-game.off_num);
                game.ot_poss = 2;
            }
        }
    };

    async coinToss(game) {
        const awayName = game.players[game.away].team.name;
        const homeName = game.players[game.home].team.name;
        let coinPick = null;
        let result = '';
        let actFlip = null;
        let decPick = null;
        let rec_fst = 'away';
        // debugger
        if (game.isReal(game.away)) {
            // this.makeButtons('H,T', game.away)
            // do {
            //     // debugger
            coinPick = await this.input.getText(game, game.away, 'Coin Toss\n' + awayName + ' choose, [H]eads or [T]ails?\n', 'coin');
            //     if (typeof(coinPick) === 'string') {
            //         coinPick = coinPick.toUpperCase();
            //     } else {
            //         coinPick = null;
            //     }
            // coinPick = game.buttonPressed;
            // } while (coinPick !== 'H' && coinPick !== 'T');
        } else {  // Computer picking
            this.alertBox('Coin Toss\n' + awayName + ' choosing...\n');
            coinPick = Utils.coinFlip() ? 'H' : 'T';
        }

        // Show result
        result += awayName + ' chose ' + (coinPick === 'H' ? 'heads' : 'tails') + '!\n';
        result += 'Coin toss!!!\n\n\n\n\n';
        // Some sort of graphic
        actFlip = Utils.coinFlip() ? 'H' : 'T';
        result += 'It was ' + (actFlip === 'H' ? 'heads' : 'tails') + '...';
        this.alertBox(result);

        if (game.num_plr === 2 || actFlip === coinPick && game.away === 1 || actFlip !== coinPick && game.home === 1) {
            result = (actFlip === coinPick ? awayName : homeName) + ' choose, ';
            //do {
                // MOVE THIS TO TEXT INPUT CLASS
                if (game.isOT()) {
                    result += 'Ball [1]st or Ball [2]nd?\n';
                } else {
                    result += '[K]ick of [R]eceive?\n';
                }

                // debugger
                decPick = await this.input.getText(game, (actFlip === coinPick ? game.away : game.home), result, (game.isOT() ? 'kickDecOT' : 'kickDecReg'));
                //if (typeof(decPick) === 'string') {
                    // if (game.isOT() && (decPick === '1' || decPick === '2')) {
                    //     decPick = Number(decPick);
                    // } else { }
                    //decPick = decPick.toUpperCase();
                //} else {
                    //decPick = null;
                // }
            //} while ((!game.isOT() && decPick !== 'K' && decPick !== 'R') || (game.isOT() && decPick !== 1 && decPick !== 2));
        } else {  // Computer choosing
            this.alertBox((actFlip === coinPick ? awayName :homeName) + ' choosing...');

            decPick = Utils.randInt(1,2);
            if (!game.isOT()) {
                decPick = decPick === 1 ? 'K' : 'R';
            }
        }

        result = (actFlip === coinPick ? awayName : homeName) + ' ';

        if (game.isOT()) {
            if (decPick === '1') {
                result += 'get ball 1st';
            } else {
                result += 'get ball 2nd';
            }
        } else {
            if (decPick === 'K') {
                result += ' will kick';
            } else {
                result += ' will receive';
            }
        }

        result += '...\n';
        this.alertBox(result);

        if ((actFlip === coinPick && (decPick === '2' || decPick === 'K')) || (coinPick !== actFlip && (decPick === '1' || decPick === 'R'))) {
            rec_fst = 'home';
        }

        game.rec_first = rec_fst === 'home' ? game.home : game.away;
        game.def_num = game.rec_first;  // Because they're receiving first
        game.off_num = game.opp(game.def_num);  // Because they're kicking

        if (game.isOT()) {
            if (game.game_type !== 'otc') {
                // Might need this for graphic resetting later
            }
            game.status = 11;
            game.current_time = 0;
        }
    };

    resetVar(game) {
        if (game.qtr === 0 || (game.qtr === 4 && game.game_type === 'otc')) {
            // displayBoard()
            // printNames()
            for (let p = 1; p <= 2; p++) {
                game.players[p].score = 0;
                // printScore(p);
                // game.players[p].stats.totalYards = 0;
                // game.players[p].stats.passYards = 0;
                // game.players[p].stats.runYards = 0;
                // game.players[p].stats.timePoss = 0;
                // game.players[p].stats.firstDowns = 0;
                // game.players[p].stats.turnovers = 0;
                // game.players[p].stats.qtrScore = 0;
            }
            // Add initial entry to addRecap( initial );
            // Make a spot to store the scores for each qtr

            // OT Challenge Stuff
            if (game.qtr === 4) {
                game.down = 0;
                updateDown(game);  // Forces game to set itself up
            }
        }

        // Need the equivalent of fillBoard to add all cards

        let to = 3;
        if (game.qtr >= 4) {
            to = 1;
        }
        game.players[1].timeouts = to;
        game.players[2].timeouts = to;
        // printTO();

        if (game.qtr <= 3) {
            game.status = -1;
            // BAND-AID
            // game.qtr = 1;
            // updateDown(game);
        }

        if (game.qtr === 4 && game.game_type != 'otc' && game.players[1].score === game.players[2].score) {
            this.coinToss(game);
        }

        this.resetTime(game);

        if (!game.over) {
            if (!game.isOT()) {
                document.querySelector('.page-selection2').innerText = this.showBoard();
            }

            if (game.qtr === 3 && game.off_num !== game.rec_first) {
                this.changePoss(game);
            }
            // printNeedle(-game.off_num);

            // Make sure plays are set right for OT challenge, esp hail marys
        }

    };

    resetTime(game) {
        const over = game.qtr >= 4 && game.players[1].score !== game.players[2].score;

        if (over) {
            this.endGame(game);
        } else {
            if (game.qtr !== 0 && !(game.qtr === 4 && game.game_type === 'otc')) {
                // LATER: Record quarter score here
            }
            
            if (game.qtr !== 0) {
                this.alertBox('Quarter end...');

                // Used to check !over, but you should never get there
                if (!(game.qtr % 2) && !(game.qtr === 4 && game.game_type === 'otc')) {
                    this.alertBox('Halftime shuffle...');
                    // LATER: Stat review statBoard(game);
                }
            }

            // Get ready for OT or reset clock for next qtr
            if (game.qtr >= 4) {
                game.current_time = 0;
                game.ot_poss = 2;
                game.spot = 75;
                game.fst_down = 85;
                // moveBall('s');
                // printDown(game);
            } else {
                game.current_time = game.qtr_length;
            }

            game.qtr++;
            // printTime(game);

            // LATER: Set qtr score
            // Could update the spot and/or print new qtr

            if (game.isOT() && this.ot_qtr_switch(game)) {
                this.changePoss(game, 'nop');
                // print_needle(-game.off_num);
                // First OT needs a little help
                if (game.ot_poss == -2 && game.qtr === 5) {
                    game.ot_poss = 2;
                }
            }
        }
    };

    endGame(game) {
        const winner = (game.players[1].score > game.players[2].score) ? 1 : 2;
        const wName = game.players[winner].team.name;

        // printQtr('FINAL');
        // display game over
        // statBoard()
        // record final qtr scores
        this.alertBox(wName + ' win the game ' + game.players[winner].score + ' - ' + game.players[game.opp(winner)].score + '!!!');
        game.status = 900 + winner;
        // this.EnablePlayButton(document.querySelector('.playButton'));
        // fireworks();
        // storeStats(winner, false);
    };

    ot_poss_switch(game) {
        const qtrEven = !(game.qtr % 2);
        const offEqRec = game.off_num === game.rec_first;
        const otp = game.ot_poss;
        let possSwitch = false;
    
        if (!qtrEven && offEqRec && otp === -2 || !qtrEven && !offEqRec && otp === -1 || qtrEven && !offEqRec && otp === -2 || qtrEven && offEqRec && otp === -1) {
            possSwitch = true;
        }
    
        return possSwitch;
    };



}

