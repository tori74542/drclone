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
  stats?: EnemyStats;

  constructor(x: number, y: number, type?: TileType) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = x;
    this.y = y;
    this.type = type || this.getRandomType();

    if (this.type === TileType.Enemy) {
      this.stats = {
        attack: 5 + Math.floor(Math.random() * 3) - 1, // 5 +/- 1 (4, 5, 6) for debug
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
    switch (this.type) {
      case TileType.Sword:
        // More detailed Broadsword pointing from bottom-left to top-right
        svg = '<svg viewBox="0 0 24 24"><path d="M6.1,19.3L4.7,17.9L13.2,9.4L11.8,8L13.2,6.6L14.6,8L17.4,5.2L20.2,8L17.4,10.8L18.8,12.2L17.4,13.6L16,12.2L7.5,20.7L6.1,19.3M19.5,3.8L18.1,2.4L15.3,5.2L16.7,6.6L19.5,3.8M3,22.4L4.4,21L5.8,22.4L4.4,23.8L3,22.4Z" /></svg>';
        break;
      case TileType.Shield:
        svg = '<svg viewBox="0 0 24 24"><path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" /></svg>';
        break;
      case TileType.Potion:
        // Round flask
        svg = '<svg viewBox="0 0 24 24"><path d="M13 3H16V5H13V3M17.5 7.5L16.1 6.1C15.7 5.7 15.2 5.5 14.7 5.5H10.3C9.8 5.5 9.3 5.7 8.9 6.1L7.5 7.5C6.5 8.5 6 9.8 6 11.2V13C6 16.3 8.7 19 12 19S18 16.3 18 13V11.2C18 9.8 17.5 8.5 16.5 7.5H17.5V7.5M12 17C9.8 17 8 15.2 8 13V11.2C8 10.4 8.3 9.6 8.9 9L10.3 7.6H14.7L16.1 9C16.7 9.6 17 10.4 17 11.2V13C17 15.2 15.2 17 12 17Z" /></svg>';
        break;
      case TileType.Coin:
        svg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>';
        break;
      case TileType.Enemy:
        // Skull
        svg = '<svg viewBox="0 0 24 24"><path d="M12 2C8 2 4 5 4 9C4 11.4 5.2 13.5 7 14.9V17C7 17.6 7.4 18 8 18H9V20C9 21.1 9.9 22 11 22H13C14.1 22 15 21.1 15 20V18H16C16.6 18 17 17.6 17 17V14.9C18.8 13.5 20 11.4 20 9C20 5 16 2 12 2M12 4C15.3 4 18 6.2 18 9C18 10.9 16.9 12.6 15.2 13.5C14.8 13.7 14.5 14 14.5 14.5V16H9.5V14.5C9.5 14 9.2 13.7 8.8 13.5C7.1 12.6 6 10.9 6 9C6 6.2 8.7 4 12 4M9 8C9.6 8 10 8.4 10 9S9.6 10 9 10 8 9.6 8 9 8.4 8 9 8M15 8C15.6 8 16 8.4 16 9S15.6 10 15 10 14 9.6 14 9 14.4 8 15 8Z" /></svg>';
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
