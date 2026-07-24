import './style.css'
import { createGame } from './game.js'
import { createMindInput } from './mind.js'

const canvas = document.querySelector('#game')
const scoreEl = document.querySelector('#score')
const finalScoreEl = document.querySelector('#final-score')
const attentionVal = document.querySelector('#attention-val')
const attentionBar = document.querySelector('#attention-bar')
const laneLabel = document.querySelector('#lane-label')
const signalLabel = document.querySelector('#signal-label')
const slider = document.querySelector('#attention-slider')
const overlay = document.querySelector('#overlay')
const gameover = document.querySelector('#gameover')
const startBtn = document.querySelector('#start-btn')
const retryBtn = document.querySelector('#retry-btn')

const game = createGame(canvas, {
  onScore(n) {
    scoreEl.textContent = String(n)
  },
  onLane(_i, name) {
    laneLabel.textContent = name
  },
  onGameOver(n) {
    finalScoreEl.textContent = String(n)
    gameover.classList.remove('hidden')
  },
})

const mind = createMindInput({
  onAttention(value) {
    game.setAttention(value)
    attentionVal.textContent = String(Math.round(value))
    attentionBar.style.width = `${value}%`
    if (document.activeElement !== slider) slider.value = String(Math.round(value))
  },
  onJump() {
    if (game.isRunning()) game.requestJump()
  },
  onStatus(source) {
    signalLabel.textContent = source
  },
})

slider.addEventListener('input', () => {
  mind.setSimulatedAttention(slider.value)
})

function start() {
  overlay.classList.add('hidden')
  gameover.classList.add('hidden')
  game.start()
  mind.setSimulatedAttention(slider.value)
}

startBtn.addEventListener('click', start)
retryBtn.addEventListener('click', start)

// Primera lectura del slider
mind.setSimulatedAttention(slider.value)
