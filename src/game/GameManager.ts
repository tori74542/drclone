import { Grid } from './Grid';
import { InputHandler } from './InputHandler';
import { Tile, TileType } from './Tile';
import { Player } from './Player';
import { UpgradeManager } from './UpgradeManager';

export class GameManager {
    container: HTMLElement;
    grid: Grid;
    inputHandler: InputHandler;
    svgLayer: SVGSVGElement;
    player: Player;
    damageIndicator: HTMLElement;

    isProcessing: boolean = false;
    isGameOver: boolean = false;

    upgradeManager: UpgradeManager;
    upgradeQueue: ('coin' | 'equipment' | 'experience')[] = [];

    tileSize: number = 60;
    gapSize: number = 8;

    constructor(containerId: string) {
        const el = document.getElementById(containerId);
        if (!el) throw new Error(`Container ${containerId} not found`);
        this.container = el;
        this.player = new Player();
        this.upgradeManager = new UpgradeManager();

        // Setup Level Up Handler
        this.player.onLevelUp = (type) => {
            this.upgradeQueue.push(type);
            if (!this.isProcessing) {
                this.processUpgradeQueue();
            }
        };

        // Create Grid Container and Player Stats
        this.container.innerHTML = `
      <div class="game-container">
        <div class="grid" id="grid"></div>
        <svg class="connection-layer" id="connection-layer"></svg>
        <div id="damage-indicator"></div>
      </div>
      <div id="skill-container" class="skill-container"></div>
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
                <span class="value" id="player-attack">${this.player.baseAttack}</span>
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

        // So using a skill does NOT pass a turn itself, usually.
        this.renderGrid();
        this.setupInputListeners(gridEl);
        this.updatePlayerUI();
        this.renderSkillUI();

        // Handle resize
        window.addEventListener('resize', () => {
            this.calculateDimensions();
            this.renderGrid();
        });

        // Initial calculation
        this.calculateDimensions();
        this.renderGrid(); // Re-render with correct dimensions
    }

    calculateDimensions() {
        const gridEl = document.getElementById('grid');
        if (!gridEl) return;

        // Get available width
        // We need to account for padding of the game-container if we measure that, 
        // or just measure the grid's parent width and subtract padding.
        // Let's measure the game-container width.
        const container = this.container.querySelector('.game-container') as HTMLElement;
        if (!container) return;

        // Use window.innerWidth as a hard cap to prevent overflow if container is already too wide
        const containerWidth = Math.min(container.clientWidth, window.innerWidth);
        const padding = 20 * 2; // 20px padding on each side of game-container
        const availableWidth = containerWidth - padding;

        // On mobile, we want to fill the width.
        // On desktop, we want to cap it at 60px * 6 + gaps.

        // Calculate max possible tile size based on width
        // Width = (tileSize * 6) + (gapSize * 5) + (gapSize * 2 for grid padding)
        // Width = 6*tileSize + 7*gapSize
        // tileSize = (Width - 7*gapSize) / 6

        // We can keep gapSize fixed or scale it. Let's scale it slightly for very small screens?
        // For now, keep gap fixed at 8px unless very small.
        this.gapSize = 8;
        if (availableWidth < 400) {
            this.gapSize = 4;
        }

        const calculatedTileSize = (availableWidth - (this.gapSize * 7)) / 6;

        // Cap at 60px
        this.tileSize = Math.min(60, Math.floor(calculatedTileSize));

        // Update CSS variables
        document.documentElement.style.setProperty('--tile-size', `${this.tileSize}px`);
        document.documentElement.style.setProperty('--gap-size', `${this.gapSize}px`);
    }

    activateSkill(index: number) {
        if (this.isProcessing || this.isGameOver) return;

        const skill = this.player.skills[index];
        if (skill && skill.cooldownCurrent === 0) {
            skill.activate();
            skill.cooldownCurrent = skill.cooldownMax;
            this.renderSkillUI();
        }
    }

    renderSkillUI() {
        const skillContainer = document.getElementById('skill-container');
        if (!skillContainer) return;

        skillContainer.innerHTML = '';

        this.player.skills.forEach((skill, index) => {
            const slot = document.createElement('div');
            slot.className = 'skill-slot';

            if (skill) {
                slot.innerHTML = `
                    <div class="skill-icon">${skill.iconUrl}</div>
                    ${skill.cooldownCurrent > 0 ? `<div class="skill-cooldown-overlay">${skill.cooldownCurrent}</div>` : ''}
                `;
                slot.onclick = () => this.activateSkill(index);
                if (skill.cooldownCurrent > 0) {
                    slot.classList.add('cooldown');
                }
            } else {
                slot.classList.add('empty');
            }

            skillContainer.appendChild(slot);
        });
    }

    processUpgradeQueue() {
        if (this.upgradeQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const type = this.upgradeQueue.shift()!;
        this.upgradeManager.showUpgradeSelection(type, this.player, this.grid, () => {
            this.updatePlayerUI();
            this.renderSkillUI();
            setTimeout(() => {
                this.processUpgradeQueue();
            }, 100);
        });
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
        if (atkEl) atkEl.textContent = `${this.player.baseAttack}`;
        if (coinsEl) coinsEl.textContent = `${this.player.coins}`;
        if (eqEl) eqEl.textContent = `${this.player.equipmentPoints}`;
        if (expEl) expEl.textContent = `${this.player.experience}`;
        if (scoreEl) scoreEl.textContent = `${this.player.score}`;
        if (highScoreEl) highScoreEl.textContent = `${this.player.highScore}`;

        // Update new HP Bar
        const hpBarFill = document.getElementById('hp-bar-fill');
        const hpBarText = document.getElementById('hp-bar-text');

        if (hpBarFill && hpBarText) {
            const hpPercent = Math.max(0, (this.player.currentHp / this.player.maxHp) * 100);
            hpBarFill.style.width = `${hpPercent}%`;
            hpBarText.textContent = `${this.player.currentHp}/${this.player.maxHp}`;
        }

        // Update Defense Bar
        const defBarFill = document.getElementById('def-bar-fill');
        const defBarText = document.getElementById('def-bar-text');

        if (defBarFill && defBarText) {
            const defPercent = Math.max(0, (this.player.currentDefense / this.player.maxDefense) * 100);
            defBarFill.style.width = `${defPercent}%`;
            defBarText.textContent = `${this.player.currentDefense}/${this.player.maxDefense}`;
        }

        // Update Coin Bar
        const coinBarFill = document.getElementById('coin-bar-fill');
        const coinBarText = document.getElementById('coin-bar-text');

        if (coinBarFill && coinBarText) {
            const coinPercent = Math.max(0, (this.player.coins / this.player.maxCoins) * 100);
            coinBarFill.style.width = `${coinPercent}%`;
            coinBarText.textContent = `${this.player.coins}/${this.player.maxCoins}`;
        }

        // Update Equipment Bar
        const eqBarFill = document.getElementById('eq-bar-fill');
        const eqBarText = document.getElementById('eq-bar-text');

        if (eqBarFill && eqBarText) {
            const eqPercent = Math.max(0, (this.player.equipmentPoints / this.player.maxEquipmentPoints) * 100);
            eqBarFill.style.width = `${eqPercent}%`;
            eqBarText.textContent = `${this.player.equipmentPoints}/${this.player.maxEquipmentPoints}`;
        }

        // Update Experience Bar
        const expBarFill = document.getElementById('exp-bar-fill');
        const expBarText = document.getElementById('exp-bar-text');

        if (expBarFill && expBarText) {
            const expPercent = Math.max(0, (this.player.experience / this.player.maxExperience) * 100);
            expBarFill.style.width = `${expPercent}%`;
            expBarText.textContent = `${this.player.experience}/${this.player.maxExperience}`;
        }
    }

    setupInputListeners(gridEl: HTMLElement) {
        // Mouse Events
        gridEl.addEventListener('mousedown', (e) => this.handleInputStart(e));
        window.addEventListener('mousemove', (e) => this.handleInputMove(e));
        window.addEventListener('mouseup', () => this.inputHandler.endDrag());

        // Touch Events
        gridEl.addEventListener('touchstart', (e) => this.handleInputStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleInputMove(e), { passive: false });
        window.addEventListener('touchend', () => this.inputHandler.endDrag());
    }

    getTileFromEvent(e: MouseEvent | TouchEvent): Tile | null {
        if (e instanceof TouchEvent) {
            const touch = e.touches[0];
            // For touch events, e.target is always the starting element, so we must use elementFromPoint
            // to find the element under the finger during a drag.
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (el) {
                const t = el.closest('.tile') as HTMLElement;
                if (t && t.dataset.id) {
                    return this.findTileById(t.dataset.id);
                }
            }
            return null;
        }

        const target = e.target as HTMLElement;
        const tileEl = target.closest('.tile') as HTMLElement;
        if (tileEl) {
            return this.findTileById(tileEl.dataset.id!);
        }
        return null;
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
        if (e.cancelable && e instanceof TouchEvent) {
            e.preventDefault(); // Prevent scroll on start too if needed, but mainly move
        }
        const tile = this.getTileFromEvent(e);
        if (tile) {
            this.inputHandler.startDrag(tile);
        }
    }

    handleInputMove(e: MouseEvent | TouchEvent) {
        if (this.isProcessing || this.isGameOver) return; // Block input

        // Prevent default to stop scrolling on touch devices
        if (e instanceof TouchEvent && e.cancelable) {
            e.preventDefault();
        }

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

            // Increment turnsAlive for all EXISTING tiles (before processing turn)
            for (let y = 0; y < this.grid.height; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const tile = this.grid.getTile(x, y);
                    if (tile) {
                        tile.turnsAlive++;
                    }
                }
            }

            // Combat Logic
            this.processTurn(selectedTiles);

            // Enemy Attack Logic (Turn-Based)
            let totalEnemyAttack = 0;
            let attackingEnemyCount = 0;

            // Iterate through all tiles to find surviving enemies that are NOT new (turnsAlive >= 1)
            for (let y = 0; y < this.grid.height; y++) {
                for (let x = 0; x < this.grid.width; x++) {
                    const tile = this.grid.getTile(x, y);
                    if (tile && tile.type === TileType.Enemy && tile.turnsAlive >= 1) {
                        // It's a surviving, non-new enemy
                        totalEnemyAttack += tile.stats?.attack || 0;
                        attackingEnemyCount++;
                    }
                }
            }

            // Calculate damage: max(0, Total Enemy Attack - Player Defense)
            const damage = Math.max(0, totalEnemyAttack - this.player.currentDefense);

            // Apply damage
            this.player.currentHp = Math.max(0, this.player.currentHp - damage);

            // Degrade defense by number of attacking enemies
            if (this.player.currentDefense > 0 && attackingEnemyCount > 0) {
                this.player.currentDefense = Math.max(0, this.player.currentDefense - attackingEnemyCount);
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
                this.processUpgradeQueue();
            }, 450); // Slightly longer than CSS transition (0.4s)
        }
        this.clearSelection();
    }



    renderGrid() {
        const gridEl = document.getElementById('grid')!;
        // Use dynamic values
        const tileSize = this.tileSize;
        const gapSize = this.gapSize;

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
        let swordCount = 0;
        const killedEnemies: Tile[] = [];

        // 1. Calculate Sword Count
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Sword) {
                swordCount += 1;
            }
        });

        // 2. Predict Damage to Enemies
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Enemy) {
                const defense = tile.stats?.defense || 0;
                // Formula: BaseAttack + (SwordCount * WeaponAttack) - EnemyDefense
                const rawDamage = this.player.baseAttack + (swordCount * this.player.weaponAttack);
                const damage = Math.max(1, rawDamage - defense);

                if (tile.stats && tile.stats.hp - damage <= 0) {
                    killedEnemies.push(tile);
                }
            }
        });

        // Total damage for display (approximate, as it varies per enemy due to defense)
        // We'll return the raw damage potential for the indicator
        const totalPotentialDamage = this.player.baseAttack + (swordCount * this.player.weaponAttack);
        return { totalDamage: totalPotentialDamage, killedEnemies };
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
        let swordCount = 0;

        // Gains for this turn
        let gainedCoins = 0;
        let gainedEquipment = 0;
        let gainedExperience = 0;

        // Decrease Cooldowns
        this.player.skills.forEach(skill => {
            if (skill && skill.cooldownCurrent > 0) {
                skill.cooldownCurrent--;
            }
        });
        this.renderSkillUI();

        // 1. Calculate Sword Count
        selectedTiles.forEach(tile => {
            if (tile.type === TileType.Sword) {
                swordCount += 1;
                tilesToRemove.push(tile);
            }
        });

        // 2. Apply Damage and Collect Resources
        selectedTiles.forEach((tile, index) => {
            if (tile.type === TileType.Enemy) {
                const defense = tile.stats?.defense || 0;
                const rawDamage = this.player.baseAttack + (swordCount * this.player.weaponAttack);
                const damage = Math.max(1, rawDamage - defense);

                if (tile.stats) {
                    tile.stats.hp -= damage;
                    if (tile.stats.hp <= 0) {
                        tilesToRemove.push(tile);
                        gainedExperience += 1;
                        // Score for kill: 50 points per kill
                        this.player.score += 50;
                    }
                }
            } else if (tile.type !== TileType.Sword) {
                tilesToRemove.push(tile);

                // Check for Bonus (4th tile onwards)
                let multiplier = 1;
                if (index >= 3) {
                    let bonusRate = 0;
                    if (tile.type === TileType.Coin) bonusRate = this.player.coinBonusRate;
                    if (tile.type === TileType.Shield) bonusRate = this.player.shieldBonusRate;
                    if (tile.type === TileType.Potion) bonusRate = this.player.potionBonusRate;

                    if (Math.random() < bonusRate) {
                        multiplier = 2;
                        console.log(`Bonus! Double ${tile.type}`);
                    }
                }

                // Resources
                if (tile.type === TileType.Coin) {
                    gainedCoins += 1 * multiplier;
                    this.player.score += 10 * multiplier;
                }
                if (tile.type === TileType.Potion) {
                    const healAmount = 1 * multiplier;
                    this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + healAmount);
                }
                if (tile.type === TileType.Shield) {
                    const totalGain = this.player.shieldValue * multiplier;
                    for (let i = 0; i < totalGain; i++) {
                        if (this.player.currentDefense < this.player.maxDefense) {
                            this.player.currentDefense += 1;
                        } else {
                            gainedEquipment += 1;
                        }
                    }
                }
            }
        });

        // 3. Apply Gains in Order: Coins -> Equipment -> Experience
        if (gainedCoins > 0) this.player.addCoins(gainedCoins);
        if (gainedEquipment > 0) this.player.addEquipmentPoints(gainedEquipment);
        if (gainedExperience > 0) this.player.addExperience(gainedExperience);

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
