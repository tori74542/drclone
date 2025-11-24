export class Player {
    maxHp: number;
    currentHp: number;
    attack: number;
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

    constructor() {
        this.maxHp = 100;
        this.currentHp = 99;
        this.attack = 1;
        this.maxDefense = 10;
        this.currentDefense = 9;
        this.coins = 0;
        this.maxCoins = 100;
        this.equipmentPoints = 0;
        this.maxEquipmentPoints = 100;
        this.experience = 0;
        this.maxExperience = 100;
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
        console.log("Level Up Coins! (Dummy)");
    }

    private levelUpEquipment() {
        console.log("Level Up Equipment! (Dummy)");
    }

    private levelUpExperience() {
        console.log("Level Up Experience! (Dummy)");
    }
}
