export const TileType = {
  Sword: 'sword',
  Shield: 'shield',
  Potion: 'potion',
  Coin: 'coin',
  Enemy: 'enemy'
} as const;

export type TileType = typeof TileType[keyof typeof TileType];

export interface EnemyStats {
  attack: number;
  defense: number;
  hp: number;
}

export class Tile {
  id: string;
  type: TileType;
  x: number;
  y: number;
  isNew: boolean = true;
  turnsAlive: number = 0;
  stats?: EnemyStats;

  constructor(x: number, y: number, type?: TileType) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.type = type || this.getRandomType();
    this.turnsAlive = 0;

    if (this.type === TileType.Enemy) {
      this.stats = {
        attack: 2 + Math.floor(Math.random() * 3) - 1, // 2 +/- 1 (1, 2, 3) for debug
        defense: 0, // Debug: set to 0 to test kill mark
        hp: 3 + Math.floor(Math.random() * 3) - 1 // 3 +/- 1 (2, 3, 4) for debug
      };
    }
  }

  private getRandomType(): TileType {
    const types = Object.values(TileType);
    // Weighted random could go here, but simple random for now
    return types[Math.floor(Math.random() * types.length)];
  }

  getIcon(): string {
    let svg = '';
    const baseUrl = import.meta.env.BASE_URL;
    switch (this.type) {
      case TileType.Sword:
        svg = `<img src="${baseUrl}sword.svg" class="tile-icon" />`;
        break;
      case TileType.Shield:
        svg = `<img src="${baseUrl}shield.svg" class="tile-icon" />`;
        break;
      case TileType.Potion:
        svg = `<img src="${baseUrl}potion.svg" class="tile-icon" />`;
        break;
      case TileType.Coin:
        svg = `<img src="${baseUrl}coin.svg" class="tile-icon" />`;
        break;
      case TileType.Enemy:
        svg = `<img src="${baseUrl}enemy.svg" class="tile-icon" />`;
        break;
      default:
        svg = '';
    }

    if (this.type === TileType.Enemy && this.stats) {
      return `
        ${svg}
        <div class="enemy-stats">
          <div class="stat-attack">${this.stats.attack}</div>
          <div class="stat-defense">${this.stats.defense}</div>
          <div class="stat-hp">${this.stats.hp}</div>
        </div>
      `;
    }

    return svg;
  }
}
