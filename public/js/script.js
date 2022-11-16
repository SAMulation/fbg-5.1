/* global Pusher */
/* global prompt */
import Team from './team.js'
import Game from './game.js'
import Site from './site.js'
import ButtonInput from './buttonInput.js'
import PromptInput from './promptInput.js'
import FormInput from './formInput.js'
import { TEAMS } from './teams.js'
import Utils from './remoteUtils.js'
import { animationWaitForCompletion, animationWaitThenHide } from './graphics.js'
const channel = null

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true

const pusher = new Pusher('41b31f79c4e658e350a5', {
  userAuthentication: {
    endpoint: '/.netlify/functions/main/pusher/user-auth'
  },
  channelAuthorization: { endpoint: '/.netlify/functions/main/pusher/auth' },
  cluster: 'us3'
})

pusher.signin()

// pusher.bind('pusher:signin_success', (data) => {
//   channel = pusher.subscribe('private-channel')

//   setTimeout(() => {
//     channel.trigger('client-my-event', { name: 'footbored' })
//   }, 5000)

//   channel.bind('client-my-event', function (data) {
//     alert(JSON.stringify(data))
//   })
// })

// FIX: REMOVE LATER - Set to window for easy access
const site = new Site(document.querySelector('.main-container'))
const resumeSelection = document.getElementById('resume-game')
const startScreen = document.querySelector('.start-screen')
const titleBall = startScreen.querySelector('.title-ball')
const setupButtons = document.querySelectorAll('.setup-button')
const loginPanel = document.querySelector('.start-screen-login')
const gamePickPanel = document.querySelector('.start-screen-game-pick')
const multiPickPanel = document.querySelector('.start-screen-multi-pick')
const onlinePickPanel = document.querySelector('.start-screen-online-pick')
const hostCodePanel = document.querySelector('.start-screen-host-code')
const gamecodeSpan = hostCodePanel.querySelector('span')
const remoteCodePanel = document.querySelector('.start-screen-remote-code')
const gamecodeInput = remoteCodePanel.querySelector('.game-code-input')
const team1Panel = document.querySelector('.start-screen-team1')
const team1SelectionLabel = document.getElementById('p1-selection-label')
const team2Panel = document.querySelector('.start-screen-team2')
const team2SelectionLabel = document.getElementById('p2-selection-label')
const gameOptionsPanel = document.querySelector('.start-screen-game-options')
const pickHome = document.getElementById('pick-home')
const pickQtrLen = document.getElementById('pick-qtrlen')
const loadingPanel = document.querySelector('.start-screen-loading')
const loadingPanelText = loadingPanel.querySelector('h1')
window.site = site
window.inputType = 'button'

// FUNCTION DEFINITIONS
const playGame = async (game) => {
  await game.runIt(channel)

  // LATER: Get ready for next game
  // EnablePlayButton(document.querySelector('.playButton'))
}

const hideElement = el => {
  el.style.display = 'none'
}

// Attach 'next' event listeners to setup buttons
const attachNextEvent = async (site, buttons) => {
  buttons.forEach(async button => {
    button.addEventListener('click', async event => {
      const val = event.target.getAttribute('data-button-value')

      if (val === 'login') {
        await animationWaitThenHide(loginPanel, 'fade')
        titleBall.classList.toggle('spin', false)
        await animationWaitForCompletion(gamePickPanel, 'fade', false)
      } else if (val === 'resume') {
        await animationWaitThenHide(startScreen, 'fade')
        site.connectionType = 'resume'
        site.game = initGame(site)
        playGame(site.game)
      } else if (val === 'single') {
        hideElement(multiPickPanel)
        hideElement(onlinePickPanel)
        hideElement(hostCodePanel)
        hideElement(remoteCodePanel)
        site.connectionType = 'single'
        await animationWaitThenHide(gamePickPanel, 'fade')
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'multi') {
        await animationWaitThenHide(gamePickPanel, 'fade')
        await animationWaitForCompletion(multiPickPanel, 'fade', false)
      } else if (val === 'about') {
        // Pull up about
      } else if (val === 'local-multi') {
        hideElement(onlinePickPanel)
        hideElement(hostCodePanel)
        hideElement(remoteCodePanel)
        site.connectionType = 'double'
        await animationWaitThenHide(multiPickPanel, 'fade')
        team2SelectionLabel.innerText = 'Select player 2\'s team'
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'online-multi') {
        hideElement(team2Panel)
        await animationWaitThenHide(multiPickPanel, 'fade')
        await animationWaitForCompletion(onlinePickPanel, 'fade', false)
      } else if (val === 'story') {
        hideElement(onlinePickPanel)
        hideElement(hostCodePanel)
        hideElement(remoteCodePanel)
        site.connectionType = 'computer'
        await animationWaitThenHide(multiPickPanel, 'fade')
        team1SelectionLabel.innerText = 'Select player 1\'s team'
        team2SelectionLabel.innerText = 'Select player 2\'s team'
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'story-online') {
        let storyType = null
        hideElement(onlinePickPanel)
        hideElement(hostCodePanel)
        hideElement(remoteCodePanel)
        hideElement(team2Panel)
        while (storyType !== 'host' && storyType !== 'remote') {
          storyType = prompt('Is this the [host] or the [remote]?')
        }
        site.connectionType = 'computer-' + (storyType === 'host' ? 'host' : 'remote')
        await generateCode(site)
        await animationWaitThenHide(multiPickPanel, 'fade')
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'host') {
        site.connectionType = 'host'
        hideElement(remoteCodePanel)
        await generateCode(site)
        gamecodeSpan.innerText = site.gamecode

        await animationWaitThenHide(onlinePickPanel, 'fade')
        await animationWaitForCompletion(hostCodePanel, 'fade', false)
      } else if (val === 'remote') {
        site.connectionType = 'remote'
        hideElement(hostCodePanel)

        await animationWaitThenHide(onlinePickPanel, 'fade')
        await animationWaitForCompletion(remoteCodePanel, 'fade', false)
      } else if (val === 'sms') {
        // window.location.href = 'sms://&body=It%27s%20football%20season!%20Let%27s%20play%20some%20FootBored.%20Head%20to%20footbored.com%20and%20use%20the%20code:%20' + site.gamecode
        window.location.href = 'sms:?&body=It%27s%20football%20season!%20Let%27s%20play%20some%20FootBored.%20Head%20to%20footbored.com%20and%20use%20the%20code:%20' + site.gamecode
      } else if (val === 'copy') {
        navigator.clipboard.writeText(site.gamecode)
      } else if (val === 'host-next') {
        await animationWaitThenHide(hostCodePanel, 'fade')
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'paste') {
        gamecodeInput.value = await navigator.clipboard.readText()
      } else if (val === 'remote-next') {
        site.gamecode = gamecodeInput.value
        await animationWaitThenHide(remoteCodePanel, 'fade')
        await animationWaitForCompletion(team1Panel, 'fade', false)
      } else if (val === 'p1-next') {
        await animationWaitThenHide(team1Panel, 'fade')
        if (site.connectionType === 'host' || site.connectionType === 'computer-host') {
          await animationWaitForCompletion(gameOptionsPanel, 'fade', false)
        } else if (site.connectionType === 'remote' || site.connectionType === 'computer-remote') {
          hideElement(gameOptionsPanel)
          await animationWaitForCompletion(loadingPanel, 'fade', false)
          submitGame(site, site.connectionType)
        } else {
          loadingPanelText.innerText = 'Loading game...'
          await animationWaitForCompletion(team2Panel, 'fade', false)
        }
      } else if (val === 'p2-next') {
        await animationWaitThenHide(team2Panel, 'fade')
        await animationWaitForCompletion(gameOptionsPanel, 'fade', false)
      } else if (val === 'game-options-next') {
        site.home = parseInt(pickHome.value)
        site.qtrLength = parseInt(pickQtrLen.value)
        await animationWaitThenHide(gameOptionsPanel, 'fade')
        await animationWaitForCompletion(loadingPanel, 'fade', false)
        submitGame(site, site.connectionType)
      }
    })
  })
}

// SITE FUNCTIONS
const setTeamLists = async lists => {
  lists.forEach(async list => {
    list.removeChild(list.firstElementChild)
    for (let t = 0; t < TEAMS.length; t++) {
      const team = new Team(TEAMS[t])
      const el = document.createElement('option')
      el.textContent = team.print
      el.value = t
      list.appendChild(el)
    }
    // list.selectedIndex = list.id === 'p1Team' ? 24 : 2
    list.selectedIndex = await Utils.randInt(0, 31)
  })
}

const connections = (site, type) => {
  if (type === 'single') {
    site.connections[1] = 'local'
    site.connections[2] = 'computer'
    site.numberPlayers = 1
    site.me = 1
  } else if (type === 'double') {
    site.connections[1] = 'local'
    site.connections[2] = 'local'
    site.numberPlayers = 2
    site.me = 1
  } else if (type === 'host') {
    site.connections[1] = 'host'
    site.connections[2] = 'remote'
    site.numberPlayers = 2
    site.me = 1
  } else if (type === 'remote') {
    site.connections[1] = 'host'
    site.connections[2] = 'remote'
    site.numberPlayers = 2
    site.me = 2
  } else if (type === 'computer') {
    site.connections[1] = 'computer'
    site.connections[2] = 'computer'
    site.numberPlayers = 0
    site.me = 0
    site.animation = true // false
  } else if (type === 'computer-host') {
    site.connections[1] = 'host'
    site.connections[2] = 'remote'
    site.numberPlayers = 0
    site.me = 0
    site.animation = true // false
  } else if (type === 'computer-remote') {
    site.connections[1] = 'host'
    site.connections[2] = 'remote'
    site.numberPlayers = 0
    site.me = 0
    site.animation = true // false
  }
}

const generateCode = async (site) => {
  if (site.connectionType === 'host') {
    site.gamecode = await Utils.randInt(1000, 9999)
    //  alert("Here's your game code: " + site.gamecode)
  } else if (site.connectionType === 'remote') {
    // site.gamecode = prompt('Enter your game code:')
    // LATER: Make sure to validate this somewhere
  } else if (site.connectionType === 'computer-host') {
    site.gamecode = 6969
  } else if (site.connectionType === 'computer-remote') {
    site.gamecode = 6969
  }
}

// const submitTeams = async (site, submit) => {
//   submit.addEventListener('submit', async event => {
//     event.preventDefault()
//     let el
//     const value = [-1, -1]
//     let valid = true
//     site.connectionType = submit.elements.connection.value
//     connections(site, site.connectionType)

//     await generateCode(site)

//     for (let t = 0; t < 2 && valid; t++) {
//       el = document.getElementById('p' + (t + 1) + 'Team')
//       value[t] = el.selectedIndex

//       if (value[t] === -1) {
//         valid = false
//       }
//     }

//     if (valid && value[0] !== -1 && value[1] !== -1) {
//       site.team1 = value[0]
//       site.team2 = value[1]
//       site.game = initGame(site)
//       window.game = site.game
//       // document.querySelector('.playButton').disabled = false
//       document.querySelector('.playSubmit').disabled = true
//       playGame(site.game)
//     }
//   })
// }

const submitGame = async (site, type) => {
  let el
  const value = [-1, -1]
  let valid = true
  site.connectionType = type

  titleBall.classList.toggle('spin', true)

  connections(site, site.connectionType)

  for (let t = 0; t < 2 && valid; t++) {
    el = document.getElementById('p' + (t + 1) + 'Team')
    value[t] = el.selectedIndex

    if (value[t] === -1) {
      valid = false
    }
  }

  if (valid && value[0] !== -1 && value[1] !== -1) {
    site.team1 = value[0]
    site.team2 = value[1]
    site.game = initGame(site)
    window.game = site.game
    // document.querySelector('.playButton').disabled = false
    // document.querySelector('.playSubmit').disabled = true
    playGame(site.game)
  }
}

// const pressPlayButton = (button, site) => {
//   button.addEventListener('pointerdown', event => {
//     playGame(site.game)
//     event.target.setAttribute('disabled', '')
//   })
// }

// const EnablePlayButton = (button) => {
//   button.innerText = 'Play Again?'
//   button.disabled = false
//   pressPlayButton(button)
// }

const initGame = (site) => {
  const user = [null, null, null]

  if (window.inputType === 'prompt') {
    window.inputType = new PromptInput()
  } else if (window.inputType === 'form') {
    window.inputType = new FormInput()
  } else {
    window.inputType = new ButtonInput()
  }

  // Remote passes team, host waits for it
  // if (site.connectionType === 'host' || site.connectionType === 'computer-host') {

  // } else if (site.connectionType === 'remote') {

  // }

  // // Host passes site, remote waits for it
  // if (site.connectionType === 'host') {

  // } else if (site.connectionType === 'remote' || site.connectionType === 'computer-remote') {

  // }

  if (site.connectionType === 'resume') {
    return new Game(window.localStorage.getItem('savedGame'), { gamecode: site.gamecode, pusher })
  } else {
    return new Game(null, { me: site.me, connections: site.connections, type: site.connectionType, host: site.host, channel: site.channel, gamecode: site.gamecode, pusher }, site.team1, site.team2, site.numberPlayers, site.gameType, site.home, site.qtrLength, site.animation, user[1], user[2], window.inputType)
  }
}

// MAIN FUNCTION CALLS
if (window.localStorage.getItem('savedGame')) {
  resumeSelection.disabled = false
}
await setTeamLists(document.querySelectorAll('.teamList'))
// submitTeams(site, document.querySelector('#gameForm'))
// pressPlayButton(document.querySelector('.playButton'), site)
attachNextEvent(site, setupButtons)
