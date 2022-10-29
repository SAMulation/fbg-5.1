export const MATCHUP = [[5, 3, 3, 2],
  [2, 4, 1, 2],
  [3, 2, 5, 3],
  [1, 2, 2, 4]]

export const MULTI = [[4, 3, 2, 1.5, 1],
  [3, 2, 1, 1, 0.5],
  [2, 1, 0.5, 0, 0],
  [0, 0, 0, -1, -1]]

// TIME CHANGE CONSTANTS
export const CHANGE = 0 // Regular play, ok to change time
export const TB = 1 // Touchback
export const PEN_DOWN = 2 // Penalty, loss of down
export const PEN_NO_DOWN = 3 // Penalty, no loss of down
export const TIMEOUT = 4 // Timeout called
export const TWOMIN = 9 // Actively in two minute warning

// STATUS CONSTANTS
export const SAFETY_KICK = -4
export const KICKOFF = -3
export const KICK = -1
export const INIT = 0
export const INIT_OTC = 1
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
