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

    constructor() {
        this.maxHp = 100;
        this.currentHp = 99;
        this.attack = 1;
        this.maxDefense = 10;
        this.currentDefense = 9;
        this.coins = 0;
        this.equipmentPoints = 0;
        this.experience = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dungeon-raid-high-score') || '0', 10);
    }
}
