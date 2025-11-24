import { Grid } from './Grid';
import { InputHandler } from './InputHandler';
import { Tile, TileType } from './Tile';
import { Player } from './Player';

export class GameManager {
    container: HTMLElement;
    grid: Grid;
    inputHandler: InputHandler;
    svgLayer: SVGSVGElement;
    player: Player;
    damageIndicator: HTMLElement;

    isProcessing: boolean = false;
    isGameOver: boolean = false;

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Container ${containerId} not found`);
        this.container = el;
        this.player = new Player();

        // Create Grid Container and Player Stats
        this.container.innerHTML = `
      <div class="game-container">
        <div class="grid" id="grid"></div>
        <svg class="connection-layer" id="connection-layer"></svg>
        <div id="damage-indicator"></div>
      </div>
      <div class="player-stats" id="player-stats">
        <div class="stats-row">
            <div class="stat-item hp">
                <span class="label">HP</span>
                <span class="value" id="player-hp">${this.player.currentHp}/${this.player.maxHp}</span>
            </div>
            <div class="stat-item defense">
                <span class="label">DEF</span>
                <span class="value" id="player-defense">${this.player.currentDefense}/${this.player.maxDefense}</span>
            </div>
            <div class="stat-item attack">
                <span class="label">ATK</span>
                <span class="value" id="player-attack">${this.player.attack}</span>
            </div>
        </div>
        <div class="stats-row">
            <div class="stat-item coins">
                <span class="label">COIN</span>
                <span class="value" id="player-coins">${this.player.coins}</span>
            </div>
            <div class="stat-item equipment">
                <span class="label">EQ</span>
                <span class="value" id="player-equipment">${this.player.equipmentPoints}</span>
            </div>
            <div class="stat-item exp">
                <span class="label">EXP</span>
                <span class="value" id="player-exp">${this.player.experience}</span>
            </div>
        </div>
        </div>
        <div class="stats-row">
            <div class="stat-item score">
                <span class="label">SCORE</span>
                <span class="value" id="player-score">${this.player.score}</span>
            </div>
             <div class="stat-item high-score">
                <span class="label">HIGH</span>
                <span class="value" id="player-high-score">${this.player.highScore}</span>
            </div>
        </div>
      </div>
    `;

        const gridEl = document.getElementById('grid')!;
        this.svgLayer = document.getElementById('connection-layer') as unknown as SVGSVGElement;
        this.damageIndicator = document.getElementById('damage-indicator')!;

        this.grid = new Grid();
        this.inputHandler = new InputHandler(
            this.grid,
            this.onSelectionChange.bind(this),
            this.onSelectionEnd.bind(this)
        );

        this.renderGrid();
        this.setupInputListeners(gridEl);
        this.updatePlayerUI();
    }

    updatePlayerUI() {
        const hpEl = document.getElementById('player-hp');
        const defEl = document.getElementById('player-defense');
        const atkEl = document.getElementById('player-attack');
        const coinsEl = document.getElementById('player-coins');
        const eqEl = document.getElementById('player-equipment');
        const expEl = document.getElementById('player-exp');
        const scoreEl = document.getElementById('player-score');
        const highScoreEl = document.getElementById('player-high-score');

        if (hpEl) hpEl.textContent = `${this.player.currentHp}/${this.player.maxHp}`;
        if (defEl) defEl.textContent = `${this.player.currentDefense}/${this.player.maxDefense}`;
        if (atkEl) atkEl.textContent = `${this.player.attack}`;
        if (coinsEl) coinsEl.textContent = `${this.player.coins}`;
        if (eqEl) eqEl.textContent = `${this.player.equipmentPoints}`;
        if (expEl) expEl.textContent = `${this.player.experience}`;
        if (scoreEl) scoreEl.textContent = `${this.player.score}`;
        if (highScoreEl) highScoreEl.textContent = `${this.player.highScore}`;
    }

    setupInputListeners(gridEl: HTMLElement) {
        // Mouse Events
        gridEl.addEventListener('mousedown', (e) => this.handleInputStart(e));
        window.addEventListener('mousemove', (e) => this.handleInputMove(e));
        window.addEventListener('mouseup', () => this.inputHandler.endDrag());

        // Touch Events
        gridEl.addEventListener('touchstart', (e) => this.handleInputStart(e));
        window.addEventListener('touchmove', (e) => this.handleInputMove(e));
        window.addEventListener('touchend', () => this.inputHandler.endDrag());
    }

    getTileFromEvent(e: MouseEvent | TouchEvent): Tile | null {
        const target = e.target as HTMLElement;
        const tileEl = target.closest('.tile') as HTMLElement;
        if (!tileEl) {
            // Handle touch move which might be over an element but target is where it started
            if (e instanceof TouchEvent) {
                const touch = e.touches[0];
                const el = document.elementFromPoint(touch.clientX, touch.clientY);
                if (el) {
                    const t = el.closest('.tile') as HTMLElement;
                    if (t && t.dataset.id) {
                        return this.findTileById(t.dataset.id);
                    }
                }
            }
            return null;
        }
        return this.findTileById(tileEl.dataset.id!);
    }

    findTileById(id: string): Tile | null {
        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const tile = this.grid.getTile(x, y);
                if (tile && tile.id === id) return tile;
            }
        }
        return null;
    }

    handleInputStart(e: MouseEvent | TouchEvent) {
        if (this.isProcessing || this.isGameOver) return; // Block input
        e.preventDefault(); // Prevent scroll
        const tile = this.getTileFromEvent(e);
        if (tile) {
            this.inputHandler.startDrag(tile);
        }
    }

    handleInputMove(e: MouseEvent | TouchEvent) {
        if (this.isProcessing || this.isGameOver) return; // Block input
        const tile = this.getTileFromEvent(e);
        if (tile) {
            this.inputHandler.continueDrag(tile);
        }

        // Update damage indicator position
        if (this.damageIndicator.classList.contains('visible')) {
            const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
            this.damageIndicator.style.left = `${clientX}px`;
            this.damageIndicator.style.top = `${clientY}px`;
        }
    }

    onSelectionChange(selectedTiles: Tile[]) {
        this.renderSelection(selectedTiles);
        this.updateDamagePreview(selectedTiles);
    }
    onSelectionEnd(selectedTiles: Tile[]) {
        if (selectedTiles.length >= 3) {
            this.isProcessing = true; // Start blocking

            // Combat Logic
            this.processTurn(selectedTiles);

            // Enemy Attack Logic (Turn-Based)
            // Iterate through all tiles to find surviving enemies
            for (let y = 0; y < this.grid.height; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const tile = this.grid.getTile(x, y);
                    if (tile && tile.type === TileType.Enemy && !tile.isNew) {
                        // It's a surviving enemy
                        const enemyAttack = tile.stats?.attack || 0;
                        const playerDefense = this.player.currentDefense;

                        // Calculate damage: max(0, Enemy Attack - Player Defense)
                        const damage = Math.max(0, enemyAttack - playerDefense);

                        // Apply damage
                        this.player.currentHp = Math.max(0, this.player.currentHp - damage);

                        // Degrade defense
                        if (this.player.currentDefense > 0) {
                            this.player.currentDefense -= 1;
                        }
                    }
                }
            }

            // Check for Game Over
            if (this.player.currentHp <= 0) {
                this.handleGameOver();
            }

            this.renderGrid();
            this.updatePlayerUI();

            // Unblock after animation
            setTimeout(() => {
                this.isProcessing = false;
            }, 450); // Slightly longer than CSS transition (0.4s)
        }
        this.clearSelection();
    }



    renderGrid() {
        const gridEl = document.getElementById('grid')!;
        const tileSize = 60;
        const gapSize = 8;

        // Track existing elements to remove dead ones
        const existingIds = new Set<string>();
        gridEl.querySelectorAll('.tile').forEach(el => {
            existingIds.add((el as HTMLElement).dataset.id!);
        });

        const activeIds = new Set<string>();

        for (let y = 0; y < this.grid.height; y++) {
            for (let x = 0; x < this.grid.width; x++) {
                const tile = this.grid.getTile(x, y);
                if (tile) {
                    activeIds.add(tile.id);
                    let tileEl = document.getElementById(`tile-${tile.id}`);

                    const leftPos = gapSize + x * (tileSize + gapSize);
                    const topPos = gapSize + y * (tileSize + gapSize);

                    if (!tileEl) {
                        // Create new tile
                        tileEl = document.createElement('div');
                        tileEl.id = `tile-${tile.id}`;
                        tileEl.className = `tile ${tile.type}`;
                        tileEl.dataset.id = tile.id;
                        tileEl.innerHTML = tile.getIcon();

                        // Initial position (start from above if new)
                        if (tile.isNew) {
                            // Start from above the grid
                            tileEl.style.left = `${leftPos}px`;
                            tileEl.style.top = `-${tileSize}px`;
                            tile.isNew = false; // Reset flag
                        } else {
                            // Should not happen for existing tiles unless logic error, but safe fallback
                            tileEl.style.left = `${leftPos}px`;
                            tileEl.style.top = `${topPos}px`;
                        }

                        gridEl.appendChild(tileEl);

                        // Force reflow to enable transition
                        tileEl.getBoundingClientRect();
                    } else {
                        // Update existing tile content (e.g. HP change)
                        if (tile.type === TileType.Enemy) {
                            tileEl.innerHTML = tile.getIcon();
                        }
                    }

                    // Update position (triggers transition)
                    tileEl.style.left = `${leftPos}px`;
                    tileEl.style.top = `${topPos}px`;

                    // Update data attributes for selection logic
                    tileEl.dataset.x = x.toString();
                    tileEl.dataset.y = y.toString();
                }
            }
        }

        // Remove tiles that are no longer in the grid
        existingIds.forEach(id => {
            if (!activeIds.has(id)) {
                const el = document.getElementById(`tile-${id}`);
                if (el) {
                    // Optional: Animate out?
                    el.style.transform = 'scale(0)';
                    el.style.opacity = '0';
                    setTimeout(() => el.remove(), 200);
                }
            }
        });
    }

    renderSelection(selectedTiles: Tile[]) {
        // Highlight tiles
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(t => {
            t.classList.remove('selected');
            t.classList.remove('dimmed');
        });

        if (selectedTiles.length > 0) {
            tiles.forEach(t => t.classList.add('dimmed'));
            selectedTiles.forEach(tile => {
                const el = document.getElementById(`tile-${tile.id}`);
                if (el) {
                    el.classList.add('selected');
                    el.classList.remove('dimmed');
                }
            });
        }

        // Draw line
        this.drawConnectionLine(selectedTiles);
    }

    clearSelection() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(t => {
            t.classList.remove('selected');
            t.classList.remove('dimmed');
        });
        this.svgLayer.innerHTML = '';
    }

    drawConnectionLine(tiles: Tile[]) {
        this.svgLayer.innerHTML = '';
        if (tiles.length < 2) return;

        const points = tiles.map(tile => {
            const el = document.getElementById(`tile-${tile.id}`);
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const containerRect = this.container.querySelector('.game-container')!.getBoundingClientRect();

            // Calculate center relative to container
            const x = rect.left - containerRect.left + rect.width / 2;
            const y = rect.top - containerRect.top + rect.height / 2;
            return `${x},${y}`;
        }).filter(p => p !== null);

        if (points.length < 2) return;

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points.join(' '));
        polyline.setAttribute('class', 'connection-line');

        // Set color based on first tile
        const firstTile = tiles[0];
        let color = '#fff';
        // Map tile type to color (should match CSS)
        if (firstTile.type === TileType.Sword) color = '#ecf0f1';
        if (firstTile.type === TileType.Shield) color = '#3498db';
        if (firstTile.type === TileType.Potion) color = '#e74c3c';
        if (firstTile.type === TileType.Coin) color = '#f1c40f';
        if (firstTile.type === TileType.Enemy) color = '#bdc3c7';

        polyline.style.stroke = color;

        this.svgLayer.appendChild(polyline);
    }

    calculateCombatResult(selectedTiles: Tile[]): { totalDamage: number, killedEnemies: Tile[] } {
        let totalAttack = 0;
        const killedEnemies: Tile[] = [];

        // 1. Calculate Total Attack
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Sword) {
                totalAttack += 1;
            }
        });

        // 2. Predict Damage to Enemies
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Enemy) {
                const defense = tile.stats?.defense || 0;
                // If swords are present, damage = max(1, attack - defense)
                // If NO swords, damage = max(1, 0 - defense) = 1 (min damage rule)
                // Wait, if 0 attack and 5 defense, 0 - 5 = -5. Max(1, -5) = 1.
                // So the formula is consistent: Math.max(1, totalAttack - defense).

                const damage = Math.max(1, totalAttack - defense);

                if (tile.stats && tile.stats.hp - damage <= 0) {
                    killedEnemies.push(tile);
                }
            }
        });

        return { totalDamage: totalAttack, killedEnemies };
    }

    updateDamagePreview(selectedTiles: Tile[]) {
        // Reset styles
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('will-die'));
        this.damageIndicator.classList.remove('visible');

        if (selectedTiles.length < 3) return;

        // Check if we have swords or enemies
        const hasCombat = selectedTiles.some(t => t.type === TileType.Sword || t.type === TileType.Enemy);
        if (!hasCombat) return;

        const { totalDamage, killedEnemies } = this.calculateCombatResult(selectedTiles);

        // Show damage indicator
        this.damageIndicator.textContent = `${totalDamage} dmg`;
        this.damageIndicator.classList.add('visible');

        // Mark killed enemies
        killedEnemies.forEach(tile => {
            const el = document.getElementById(`tile-${tile.id}`);
            if (el) el.classList.add('will-die');
        });
    }

    processTurn(selectedTiles: Tile[]) {
        const tilesToRemove: Tile[] = [];
        let totalAttack = 0;

        // 1. Calculate Total Attack
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Sword) {
                totalAttack += 1;
                tilesToRemove.push(tile);
            }
        });

        // 2. Apply Damage and Collect Resources
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Enemy) {
                const defense = tile.stats?.defense || 0;
                const damage = Math.max(1, totalAttack - defense);

                if (tile.stats) {
                    tile.stats.hp -= damage;
                    if (tile.stats.hp <= 0) {
                        tilesToRemove.push(tile);
                        this.player.experience += 1;
                        // Score for kill: 10 * maxHp (approx difficulty)
                        this.player.score += (tile.stats.hp + damage) * 10; // Use original HP or just damage dealt? Let's use maxHp estimate or just constant
                        // Better: 50 points per kill + bonus
                        this.player.score += 50;
                    }
                }
            } else if (tile.type !== TileType.Sword) {
                tilesToRemove.push(tile);

                // Resources
                if (tile.type === TileType.Coin) {
                    this.player.coins += 1;
                    this.player.score += 10; // 10 points per coin
                }
                if (tile.type === TileType.Potion) this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + 1);
                if (tile.type === TileType.Shield) {
                    if (this.player.currentDefense < this.player.maxDefense) {
                        this.player.currentDefense += 1;
                    } else {
                        this.player.equipmentPoints += 1;
                    }
                }
            }
        });

        this.grid.removeTiles(tilesToRemove);
        this.updateDamagePreview([]); // Clear preview
    }

    handleGameOver() {
        this.isGameOver = true;

        // Update High Score
        if (this.player.score > this.player.highScore) {
            this.player.highScore = this.player.score;
            localStorage.setItem('dungeon-raid-high-score', this.player.highScore.toString());
        }

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-content">
                <div class="game-over-title">Game Over</div>
                <div class="game-over-score">Score: ${this.player.score}</div>
                <div class="game-over-highscore">High Score: ${this.player.highScore}</div>
                <button class="restart-btn" id="restart-btn">Try Again</button>
            </div>
        `;

        this.container.appendChild(overlay);

        // Force reflow
        overlay.getBoundingClientRect();
        overlay.classList.add('visible');

        // Setup restart button
        const btn = document.getElementById('restart-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }
}
