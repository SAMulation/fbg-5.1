/* global Pusher */
/* global alert, prompt */
import Team from './team.js'
import Game from './game.js'
import Site from './site.js'
import ButtonInput from './buttonInput.js'
import PromptInput from './promptInput.js'
import FormInput from './formInput.js'
import { TEAMS } from './teams.js'
import Utils from './remoteUtils.js'
const channel = null

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true

const pusher = new Pusher('41b31f79c4e658e350a5', {
  userAuthentication: {
    endpoint: 'http://localhost:5001/pusher/user-auth'
  },
  channelAuthorization: { endpoint: 'http://localhost:5001/pusher/auth' },
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
window.site = site
window.inputType = 'button'

// FUNCTION DEFINITIONS
const playGame = async (game) => {
  await game.runIt(channel)

  // LATER: Get ready for next game
  EnablePlayButton(document.querySelector('.playButton'))
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
  }
}

const generateCode = async (site) => {
  if (site.connectionType === 'host') {
    site.gamecode = await Utils.randInt(1000, 9999)
    alert("Here's your game code: " + site.gamecode)
  } else if (site.connectionType === 'remote') {
    site.gamecode = prompt('Enter your game code:')
    // LATER: Make sure to validate this somewhere
  }
}

const submitTeams = async (site, submit) => {
  submit.addEventListener('submit', async event => {
    event.preventDefault()
    let el
    const value = [-1, -1]
    let valid = true
    site.connectionType = submit.elements.connection.value
    connections(site, site.connectionType)

    await generateCode(site)

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
      document.querySelector('.playButton').disabled = false
      document.querySelector('.playSubmit').disabled = true
    }
  })
}

const pressPlayButton = (button, site) => {
  button.addEventListener('pointerdown', event => {
    playGame(site.game)
    event.target.setAttribute('disabled', '')
  })
}

const EnablePlayButton = (button) => {
  button.innerText = 'Play Again?'
  button.disabled = false
  pressPlayButton(button)
}

const initGame = (site) => {
  const user = [null, null, null]
  if (window.inputType === 'prompt') {
    window.inputType = new PromptInput()
  } else if (window.inputType === 'form') {
    window.inputType = new FormInput()
  } else {
    window.inputType = new ButtonInput()
  }

  for (let p = 1; p <= site.numberPlayers; p++) {
    if (!window.localStorage.getItem('user' + p)) {
      while (!user[p]) {
        user[p] = prompt('What should I call player ' + p + '?', 'Player')
        window.localStorage.setItem('user' + p, user[p])
      }
    } else {
      user[p] = window.localStorage.getItem('user' + p)
    }
  }

  return new Game({ me: site.me, connections: site.connections, type: site.connectionType, host: site.host, channel: site.channel, gamecode: site.gamecode, pusher }, site.team1, site.team2, site.numberPlayers, site.gameType, site.home, site.qtrLength, user[1], user[2], window.inputType)
}

// MAIN FUNCTION CALLS
await setTeamLists(document.querySelectorAll('.teamList'))
submitTeams(site, document.querySelector('#gameForm'))
pressPlayButton(document.querySelector('.playButton'), site)
