/* global alert */

// Display alert messages somewhere cool (or in alert or in console)
export const alertBox = async (run, msg) => {
  // This is the preferred route
  if (run.alert === 'bar') {
    run.alertMessage.innerText = msg
    await sleep(run.game.animation ? 750 : 100)
  } else if (run.alert === 'alert') {
    alert(msg)
  } else {
    console.log(msg)
  }
  return new Promise(resolve => {
    resolve()
  })
}

// Helper function to 'sleep' between messages
export const sleep = async (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export const setBallSpot = async (run, forceSpot = null) => {
  // Can't force spot to be zero, but that's okay
  const newSpot = forceSpot || run.game.spot
  await sleep(100)
  // run.docStyle.setProperty('--ball-spot', (run.field.offsetHeight / 100 * ((100 - newSpot) + 42)) + 'px')
  run.docStyle.setProperty('--ball-spot', (100 - newSpot) + '%')
  await sleep(100)
}

export const firstDownLine = async (run, forceSpot = null) => {
  const newSpot = forceSpot || run.game.firstDown
  const theLine = document.querySelector('.first-down-line')
  if (newSpot < 10) {
    theLine.classList.toggle('fade', true)
  } else {
    if (theLine.classList.contains('fade')) {
      theLine.classList.toggle('fade', false)
    }
  }
  await sleep(100)
  run.docStyle.setProperty('--first-down', (100 - newSpot) + '%')
  await sleep(100)
}

export const setSpot = (run, newSpot) => {
  run.game.lastSpot = run.game.spot
  run.game.spot = newSpot
}

export const animationSimple = (el, cls, on = true) => {
  if ((on && !el.classList.contains(cls)) || (!on && el.classList.contains(cls))) {
    el.classList.toggle(cls)
  }
}

export const animationWaitForCompletion = async (el, cls, on = true) => {
  return new Promise(resolve => {
    const handler = () => {
      el.removeEventListener('transitionend', handler)
      el.removeEventListener('transitioncancel', handler)
      resolve()
    }

    el.addEventListener('transitionend', handler)
    el.addEventListener('transitioncancel', handler)
    animationSimple(el, cls, on)
  })
}

export const animationWaitThenHide = async (el, cls, on = true) => {
  if (!on) {
    el.style.display = ''
  }
  await animationWaitForCompletion(el, cls, on)
  if (on) {
    el.style.display = 'none'
  }
}

export const animationWaitThenHideParent = async (el, cls, on = true) => {
  if (!on) {
    el.parentElement.style.display = ''
  }
  await animationWaitForCompletion(el.parentElement, cls, on)
  if (on) {
    el.parentElement.style.display = 'none'
  }
}

export const animationPrePick = async (run, game, p) => {
  // if (game.isReal(p)) {
  await animationWaitForCompletion(run.cardsContainer, 'slide-down', false)
  // }
  // animationSimple(run.scoreboardContainerTopLeft, 'collapsed', false)
  // animationSimple(run.scoreboardContainerTopRight, 'collapsed', false)
}

export const animationPostPick = async (run, game, p) => {
  // animationSimple(run.scoreboardContainerTopLeft, 'collapsed')
  // animationSimple(run.scoreboardContainerTopRight, 'collapsed')

  // if (game.isReal(p)) {
  await animationWaitForCompletion(run.cardsContainer, 'slide-down')
  // }
}

export const resetBoardContainer = (run) => {
  // Clear values
  run.plCard1.querySelector('.back').innerText = ''
  run.plCard2.querySelector('.back').innerText = ''
  run.multCard.querySelector('.back').innerText = ''
  run.yardCard.querySelector('.back').innerText = ''
  // run.qualityContainer.querySelector('.back').innerText = ''
  // run.timesContainer.querySelector('.back').innerText = ''

  // Remove classes
  run.plCard1.classList.remove('picked')
  run.plCard1.classList.remove('back-home')
  run.plCard2.classList.remove('picked')
  run.plCard2.classList.remove('back-home')
  run.multCard.classList.remove('picked')
  run.yardCard.classList.remove('picked')
  // run.plCard1.querySelector('.back').classList.remove('back-home')
  // run.plCard2.querySelector('.back').classList.remove('back-home')
  // run.multCard.querySelector('.back').className = 'back'
  run.boardContainer.querySelectorAll('.back').forEach(el => {
    el.className = 'back'
  })
  // run.qualityContainer.classList.remove('picked')
  // run.timesContainer.classList.remove('picked')

  // Reset offensive squares
  run.qualityOffPlays.forEach(square => {
    // Turn off home
    square.classList.toggle('home-play', false)
    square.classList.remove('active')

    if (run.game.offNum === run.game.home) {
      square.classList.add('home-play')
    }
  })

  // Reset defensive squares
  run.qualityDefPlays.forEach(square => {
    // Turn off home
    square.classList.toggle('home-play', false)
    square.classList.remove('active')

    if (run.game.defNum === run.game.home) {
      square.classList.add('home-play')
    }
  })

  run.qualityContainer.querySelectorAll('div').forEach(square => {
    square.classList.remove('active')
  })

  run.timesContainer.querySelectorAll('div').forEach(square => {
    square.classList.remove('active')
  })

  run.timesHeader.className = 'times-header'

  run.qualityContainer.classList.toggle('fade', false)
}
