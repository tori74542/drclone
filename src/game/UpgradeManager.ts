export class UpgradeManager {
    private overlay: HTMLElement;
    private onComplete: (() => void) | null = null;

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

    showUpgradeSelection(type: 'coin' | 'equipment' | 'experience', onComplete: () => void) {
        this.onComplete = onComplete;
        const optionsContainer = this.overlay.querySelector('.upgrade-options')!;
        const titleEl = this.overlay.querySelector('.upgrade-title')!;
        titleEl.textContent = `${type.toUpperCase()} Level Up!`;
        optionsContainer.innerHTML = '';

        // Generate 3 dummy options
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `
                <div class="card-icon">?</div>
                <div class="card-title">Upgrade ${i + 1} (${type})</div>
                <div class="card-desc">Coming Soon...</div>
            `;
            card.addEventListener('click', () => this.handleSelection(i));
            optionsContainer.appendChild(card);
        }

        this.overlay.classList.add('visible');
    }

    private handleSelection(index: number) {
        console.log(`Selected upgrade option ${index}`);
        this.overlay.classList.remove('visible');
        if (this.onComplete) {
            this.onComplete();
            this.onComplete = null;
        }
    }
}
