export class Player {
    maxHp: number;
    currentHp: number;
    baseAttack: number;
    weaponAttack: number;
    maxDefense: number;
    currentDefense: number;
    coins: number;
    equipmentPoints: number;
    experience: number;
    score: number;
    highScore: number;

    maxCoins: number;
    maxEquipmentPoints: number;
    maxExperience: number;
    onLevelUp: ((type: 'coin' | 'equipment' | 'experience') => void) | null = null;

    // Bonus Rates
    coinBonusRate: number = 0.2;
    shieldBonusRate: number = 0.2;
    potionBonusRate: number = 0.2;

    constructor() {
        this.maxHp = 100;
        this.currentHp = 99;
        this.baseAttack = 1;
        this.weaponAttack = 1;
        this.maxDefense = 10;
        this.currentDefense = 9;
        this.coins = 0;
        this.maxCoins = 10;
        this.equipmentPoints = 0;
        this.maxEquipmentPoints = 10;
        this.experience = 0;
        this.maxExperience = 10;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dungeon-raid-high-score') || '0', 10);
    }

    addCoins(amount: number) {
        this.coins += amount;
        while (this.coins >= this.maxCoins) {
            this.coins -= this.maxCoins;
            this.levelUpCoins();
        }
    }

    addEquipmentPoints(amount: number) {
        this.equipmentPoints += amount;
        while (this.equipmentPoints >= this.maxEquipmentPoints) {
            this.equipmentPoints -= this.maxEquipmentPoints;
            this.levelUpEquipment();
        }
    }

    addExperience(amount: number) {
        this.experience += amount;
        while (this.experience >= this.maxExperience) {
            this.experience -= this.maxExperience;
            this.levelUpExperience();
        }
    }

    private levelUpCoins() {
        if (this.onLevelUp) this.onLevelUp('coin');
    }

    private levelUpEquipment() {
        if (this.onLevelUp) this.onLevelUp('equipment');
    }

    private levelUpExperience() {
        if (this.onLevelUp) this.onLevelUp('experience');
    }
}
