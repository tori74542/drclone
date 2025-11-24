import './style.css'
import { GameManager } from './game/GameManager'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="game-root"></div>
`

declare global {
  interface Window {
    gameManager: GameManager;
  }
}

const gameManager = new GameManager('game-root')
window.gameManager = gameManager;
