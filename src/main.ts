import './style.css'
import { GameManager } from './game/GameManager'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="game-root"></div>
`

new GameManager('game-root')
