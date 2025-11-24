import { Tile, TileType } from './Tile';

export class Grid {
    width: number;
    height: number;
    tiles: (Tile | null)[][];

    constructor(width: number = 6, height: number = 6) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.initialize();
    }

    initialize() {
        this.tiles = [];
        for (let y = 0; y < this.height; y++) {
            const row: Tile[] = [];
            for (let x = 0; x < this.width; x++) {
                row.push(new Tile(x, y));
            }
            this.tiles.push(row);
        }
    }

    getTile(x: number, y: number): Tile | null {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.tiles[y][x];
    }

    // Check if two tiles are adjacent (including diagonals)
    isAdjacent(t1: Tile, t2: Tile): boolean {
        const dx = Math.abs(t1.x - t2.x);
        const dy = Math.abs(t1.y - t2.y);
        return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
    }

    removeTiles(tilesToRemove: Tile[]) {
        // Remove tiles
        tilesToRemove.forEach(tile => {
            this.tiles[tile.y][tile.x] = null;
        });

        // Apply gravity
        for (let x = 0; x < this.width; x++) {
            let writeY = this.height - 1;
            for (let y = this.height - 1; y >= 0; y--) {
                if (this.tiles[y][x] !== null) {
                    const tile = this.tiles[y][x]!;
                    if (y !== writeY) {
                        this.tiles[writeY][x] = tile;
                        tile.y = writeY;
                        tile.isNew = false; // It's an existing tile moving down
                        this.tiles[y][x] = null;
                    }
                    writeY--;
                }
            }

            // Fill empty spaces at the top
            while (writeY >= 0) {
                this.tiles[writeY][x] = new Tile(x, writeY);
                writeY--;
            }
        }
    }
}
