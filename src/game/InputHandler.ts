import { Grid } from './Grid';
import { Tile, TileType } from './Tile';

export class InputHandler {
    grid: Grid;
    selectedTiles: Tile[] = [];
    isDragging: boolean = false;
    onSelectionChange: (tiles: Tile[]) => void;
    onSelectionEnd: (tiles: Tile[]) => void;

    constructor(grid: Grid, onSelectionChange: (tiles: Tile[]) => void, onSelectionEnd: (tiles: Tile[]) => void) {
        this.grid = grid;
        this.onSelectionChange = onSelectionChange;
        this.onSelectionEnd = onSelectionEnd;
    }

    startDrag(tile: Tile) {
        this.isDragging = true;
        this.selectedTiles = [tile];
        this.onSelectionChange(this.selectedTiles);
    }

    continueDrag(tile: Tile) {
        if (!this.isDragging) return;

        const lastTile = this.selectedTiles[this.selectedTiles.length - 1];

        // If hovering over the second to last tile, backtrack (undo selection)
        if (this.selectedTiles.length > 1 && tile === this.selectedTiles[this.selectedTiles.length - 2]) {
            this.selectedTiles.pop();
            this.onSelectionChange(this.selectedTiles);
            return;
        }

        // Check if tile is already selected
        if (this.selectedTiles.includes(tile)) return;

        // Check validity
        if (this.isValidConnection(lastTile, tile)) {
            this.selectedTiles.push(tile);
            this.onSelectionChange(this.selectedTiles);
        }
    }

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.onSelectionEnd(this.selectedTiles);
        this.selectedTiles = [];
    }

    private isValidConnection(t1: Tile, t2: Tile): boolean {
        // Must be adjacent
        if (!this.grid.isAdjacent(t1, t2)) return false;

        // Same type is always valid
        if (t1.type === t2.type) return true;

        // Special rule: Sword and Enemy can connect
        const isSwordEnemy = (t1.type === TileType.Sword && t2.type === TileType.Enemy) ||
            (t1.type === TileType.Enemy && t2.type === TileType.Sword);

        if (isSwordEnemy) return true;

        return false;
    }
}
