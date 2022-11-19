export const MATCHUP = [[5, 3, 3, 2],
  [2, 4, 1, 2],
  [3, 2, 5, 3],
  [1, 2, 2, 4]]

export const MULTI = [[4, 3, 2, 1.5, 1],
  [3, 2, 1, 1, 0.5],
  [2, 1, 0.5, 0, 0],
  [0, 0, 0, -1, -1]]

export const MODAL_MESSAGES = {
  welcome: {
    header: 'Welcome to FootBored!',
    body: `This is a digital “bored” game version of American football. If you know how to play football and the strategy involved, this game should be pretty easy to pick up. If not, it might help to brush up on some of the rules before proceeding - but a lot of beginners have been able to enjoy the game and “figure it out as they go.”

    Before playing, you should know a bit about the card mechanics. On each play, the offensive and defensive teams pick a play. There is some strategy involved here! As the offense, you want to pick the play that is “farthest away” from what the defense picked. For instance, the defense picked “short run”, you want to pick “long pass” - note that both categories are different. If you are on defense, you want to do the opposite, you want to pick as close to the same play as possible. You receive 12 of the standard Play cards before they reset - use that knowledge to your advantage!
    
    Once the game determines how good of a play call was made, a Multiplier card is flipped. How good the King, Queen, Jack, or 10 is depends on the play quality. At that point, the Yard card (0 - 10) is drawn and a little math is used to determine how many yards were gained on the play.
    
    This proceeds until you either score, turn the ball over, or are forced to kick. Again, if you know BASIC football strategy, you will figure this game out VERY quickly.`,
    buttonText: 'Special Plays',
    buttonAction: 'next',
    buttonGoTo: 'special'
  },
  special: {
    header: 'Special Plays',
    body: `I will apologize in advance here: The special plays are not well documented currently, and I will be adding more here later - I promise! So, this is your one chance to have an idea what’s happening.

    TRICK PLAY
    You get one of these per Play card shuffles. When you play a Trick Play, a die is rolled. Half the options are good and half the options are bad. Use the card wisely! It can get you a touchdown or it can cause a turnover. You have a 1 in 6 chance of the following happening:
    Long Run with 5-yard bonus, Long Pass with 5-yard bonus, 4x Multiplier, -3x Multiplier, 15-yard penalty (on you - this is poorly displayed right now, it’ll get better!), a Big Play (read on…)
    
    HAIL MARY
    This is a desperation play and should be used cautiously. You receive three of these plays per half and two per every overtime period. When you play a Hail Mary, a die is rolled. You have a 1 in 6 chance of the following events happening:
    0-yard gain, 20-yard gain, 40-yard gain, Touchdown, Big Sack (resulting in a 10-yard loss), or an interception (turned over at the spot of the play)
    
    SAME PLAY
    If you and your opponent pick the Same Play, a coin is flipped. If it’s heads, then you enter this Same Play mechanism.
    
    Once in the mechanism, a Multiplayer card is drawn and a new coin is flipped.
    King: Big Play for offense (heads) or defense (tails)
    Queen: 3x Multiplier (heads) or 0x Multiplier (tails)
    Jack: 0x Multiplier (heads) or -3x Multiplier (tails)
    10: A NEW coin is flipped and the ball is turned over (heads) or the play results in a no gain (tails)
    
    BIG PLAY
    The Big Play is ALWAYS beneficial for the player receiving it. The results depend on whether you are on offense or defense.
    
    Offensive Odds: 1 in 2 of a 25-yard gain, 1 in 3 of a 40-yard gain (or half the distance to the endzone, whichever is more), 1 in 6 of a touchdown.
    
    Defensive Odds: 1 in 2 of a 10-yard penalty (on the offense, repeat the down), 1 in 3 of a turnover with a return of 25 yards (or half the distance to the endzone, whichever is more), 1 in 6 of a turnover resulting in a defensive touchdown.`,
    buttonText: 'Strategy',
    buttonAction: 'next',
    buttonGoTo: 'strategy'
  },
  strategy: {
    header: 'A Tiny Bit of Strategy',
    body: `The clock moves 30 seconds with each play - unless there is a penalty, a timeout is called, or there is a touchback on a kick. There is a “zero-second” play at the end of the first half and regulation (overtime is untimed). Use your three timeouts (per half) to keep the game going - if you need to. If you forget to call a timeout, don’t worry, the game will remind you.

    If you are on offense, try to pick the play that is “farthest away” from the defense’s call. On defense, try to pick the play that is the “closest” to the offense’s call.
    
    Save your trick play for when you need some extra help (and don’t be discouraged if something bad happens). Also, only use your Hail Marys in times of desperation (and don’t be mad when you throw a pick when you used the Hail Mary at an inopportune time).
    
    Have fun! The games often end within one possession and many games were decided by the final few plays! Had an interesting game experience? Tell me about it at samulation.dev@gmail.com.`,
    buttonText: 'Overtime',
    buttonAction: 'next',
    buttonGoTo: 'overtime'
  },
  overtime: {
    header: 'Overtime',
    body: `Overtime in FootBored runs like college football back in the day. Each team gets one possession from the opposing team’s 25 yard line. The clock is turned off. A possession ends with either a score or a turnover. If the score is still tied at the end of the overtime period, then a new period starts. This repeats until there is a leader at the end of an overtime period.

    During the upcoming coin toss, one team will get the ball first and the other will get the ball second. If the game goes to double overtime, the team that had the ball second will get the ball first in 2OT. First possession flips every period. 
    
    Starting in the 3OT, each team MUST go for a two-point conversion. Also, note that you only receive two Hail Marys and one timeout per every two overtime periods. Play, Multiplier, and Yard cards will automatically shuffle as needed and between every two periods in overtime - don’t forget to ice the kicker if you think your opponent is kicking a FG.
    
    Good luck!`,
    buttonText: 'Upcoming Features',
    buttonAction: 'next',
    buttonGoTo: 'upcoming'
  },
  upcoming: {
    header: 'Upcoming Features',
    body: `Save and resume your game
    Able to recover from disconnection for online multiplayer
    Keep track of your stats over time
    Better system to invite friends to play
    Better explanation of special plays
    Better graphics for Play cards
    Constantly improving graphics
    Ability to make a custom team
    Fix any bugs in the game logic
    
    Thoughts
    Tournaments?
    Seasons?
    
    Good luck! And, as always, reach out to samulation.dev@gmail.com with any bugs, questions, feedback, or kudos.
    
    “It’s better than football - it’s FootBored!”`,
    buttonText: 'Exit About',
    buttonAction: 'exit',
    buttonGoTo: null
  }
}

// TIME CHANGE CONSTANTS
export const CHANGE = 0 // Regular play, ok to change time
export const TB = 1 // Touchback
export const PEN_DOWN = 2 // Penalty, loss of down
export const PEN_NO_DOWN = 3 // Penalty, no loss of down
export const TIMEOUT = 4 // Timeout called
export const TWOPT = 7 // Actively in two-point conversion
export const TWOMIN = 9 // Actively in two minute warning

// STATUS CONSTANTS
export const SAFETY_KICK = -4
export const KICKOFF = -3
export const KICK = -1 // First kickoff of half
export const INIT = 0
export const INIT_OTC = 1
export const OT_START = 2
export const REG = 11
export const OFF_TP = 12
export const DEF_TP = 13
export const SAME = 14
export const FG = 15
export const PUNT = 16
export const HAIL = 17
export const TWO_PT = 20
export const TD = 101
export const SAFETY = 102
export const REG_TURNOVER = 110
export const OFF_TP_TURNOVER = 120
export const DEF_TP_TURNOVER = 130
export const SAME_TURNOVER = 140
export const FG_TURNOVER = 150
export const PUNT_TURNOVER = 160
export const HAIL_TURNOVER = 170
export const TWO_PT_TURNOVER = 200
export const LEAVE = 900
export const P1_WINS = 901
export const P2_WINS = 902
export const EXIT = 999
