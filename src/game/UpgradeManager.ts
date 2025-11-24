import { UPGRADES, type Upgrade } from './Upgrade';

export class UpgradeManager {
    private overlay: HTMLElement;
    private onComplete: (() => void) | null = null;
    private currentUpgrades: Upgrade[] = [];
    private currentPlayer: any;
    private currentGrid: any;

    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'upgrade-overlay';
        this.overlay.innerHTML = `
            <div class="upgrade-modal">
                <h2 class="upgrade-title">Level Up!</h2>
                <div class="upgrade-options"></div>
            </div>
        `;
        document.body.appendChild(this.overlay);
    }

    showUpgradeSelection(type: 'coin' | 'equipment' | 'experience', player: any, grid: any, onComplete: () => void) {
        this.onComplete = onComplete;
        this.currentPlayer = player;
        this.currentGrid = grid;

        const optionsContainer = this.overlay.querySelector('.upgrade-options')!;
        const titleEl = this.overlay.querySelector('.upgrade-title')!;
        titleEl.textContent = `${type.toUpperCase()} Level Up!`;
        optionsContainer.innerHTML = '';

        // Get 3 random upgrades based on type
        this.currentUpgrades = this.getRandomUpgrades(type, 3);

        this.currentUpgrades.forEach((upgrade, index) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <div class="card-icon">?</div>
                <div class="card-title">${upgrade.name}</div>
                <div class="card-desc">${upgrade.description}</div>
            `;
            card.addEventListener('click', () => this.handleSelection(index));
            optionsContainer.appendChild(card);
        });

        this.overlay.classList.add('visible');
    }

    private getRandomUpgrades(type: 'coin' | 'equipment' | 'experience', count: number): Upgrade[] {
        const pool = UPGRADES.filter(u => u.type === type);
        const selected: Upgrade[] = [];

        // Clone pool to avoid modifying original if we want unique selection without replacement logic
        // For now, let's assume we want unique upgrades in the 3 choices
        const tempPool = [...pool];

        for (let i = 0; i < count; i++) {
            if (tempPool.length === 0) break;

            const totalWeight = tempPool.reduce((sum, u) => sum + u.weight, 0);
            let random = Math.random() * totalWeight;

            for (let j = 0; j < tempPool.length; j++) {
                random -= tempPool[j].weight;
                if (random <= 0) {
                    selected.push(tempPool[j]);
                    tempPool.splice(j, 1); // Remove selected to ensure uniqueness
                    break;
                }
            }
        }

        return selected;
    }

    private handleSelection(index: number) {
        const selectedUpgrade = this.currentUpgrades[index];
        console.log(`Selected upgrade: ${selectedUpgrade.name}`);

        if (selectedUpgrade.effect && this.currentPlayer && this.currentGrid) {
            selectedUpgrade.effect(this.currentPlayer, this.currentGrid);
        }

        this.overlay.classList.remove('visible');
        this.currentPlayer = null;
        this.currentGrid = null;

        if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
    }
}
