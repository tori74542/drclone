import './style.css'
import { GameManager } from './game/GameManager'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="game-root"></div>
`

const gameManager = new GameManager('game-root')
// Expose for debug if needed, but keeping it clean for now
// (window as any).gameManager = gameManager;
