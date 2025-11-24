# Dungeon Raid Clone Project Context

## Project Overview
This project is a web-based clone of the puzzle RPG "Dungeon Raid", built with **Vite**, **TypeScript**, and **Vanilla CSS**.

## Current Implementation Status

### Core Mechanics
- **Grid**: 6x6 grid system implemented in `Grid.ts`.
- **Tiles**: 5 types (Sword, Shield, Potion, Coin, Enemy) implemented in `Tile.ts`.
- **Input**: Drag-to-connect mechanic implemented in `InputHandler.ts`.
  - Supports connecting adjacent same-type tiles.
  - **Special Rule**: Swords and Enemies can be mixed in the same chain.
- **Game Loop**: Managed by `GameManager.ts`.
  - Handles tile generation, rendering, and turn management (basic).
  - **Animations**: Smooth falling animations using CSS transitions and absolute positioning.
  - **Input Blocking**: User input is blocked during animations to prevent glitches.

### Visuals & UI
- **Styling**: `style.css` handles the dark fantasy aesthetic.
- **Icons**: SVG icons used for all tiles.
  - **Sword**: Detailed broadsword (bottom-left to top-right).
  - **Enemy**: Skull icon.
  - **Potion**: Round flask.
- **Colors**:
  - Potion: Red
  - Sword/Enemy: White/Grey icons on **Black Background**.
  - Shield: Blue
  - Coin: Yellow
- **Enemy Stats**:
  - Enemies have Attack, Defense, and HP (initialized to 10±1).
  - Stats are displayed on the tile:
    - Top Right: Attack (Red)
    - Middle Right: Defense (Blue)
    - Bottom Right: HP (Green)
  - Font size and positioning are optimized to fit within the tile.

### Player Stats
- **Properties**:
  - **HP**: Max 100, Current 100.
  - **Attack**: 1.
  - **Defense**: Max 10, Current 10.
  - **Coins**: 0.
  - **Equipment Points**: 0.
  - **Experience**: 0.
  - `InputHandler.ts`: Handles mouse/touch events for the drag mechanic.
- `src/style.css`: Global styles, grid layout, and animations.

## Next Steps
1.  **Scoring System**: Implement logic to calculate score based on chain length and tile type.
2.  **Turn-Based Mechanics**:
    -   Implement player turn vs. enemy turn.
    -   Enemy attacks reduce player HP.
    -   Shields reduce incoming damage.
# Dungeon Raid Clone Project Context

## Project Overview
This project is a web-based clone of the puzzle RPG "Dungeon Raid", built with **Vite**, **TypeScript**, and **Vanilla CSS**.

## Current Implementation Status

### Core Mechanics
- **Grid**: 6x6 grid system implemented in `Grid.ts`.
- **Tiles**: 5 types (Sword, Shield, Potion, Coin, Enemy) implemented in `Tile.ts`.
- **Input**: Drag-to-connect mechanic implemented in `InputHandler.ts`.
  - Supports connecting adjacent same-type tiles.
  - **Special Rule**: Swords and Enemies can be mixed in the same chain.
- **Game Loop**: Managed by `GameManager.ts`.
  - Handles tile generation, rendering, and turn management (basic).
  - **Animations**: Smooth falling animations using CSS transitions and absolute positioning.
  - **Input Blocking**: User input is blocked during animations to prevent glitches.

### Visuals & UI
- **Styling**: `style.css` handles the dark fantasy aesthetic.
- **Icons**: SVG icons used for all tiles.
  - **Sword**: Detailed broadsword (bottom-left to top-right).
  - **Enemy**: Skull icon.
  - **Potion**: Round flask.
- **Colors**:
  - Potion: Red
  - Sword/Enemy: White/Grey icons on **Black Background**.
  - Shield: Blue
  - Coin: Yellow
- **Enemy Stats**:
  - Enemies have Attack, Defense, and HP (initialized to 10±1).
  - Stats are displayed on the tile:
    - Top Right: Attack (Red)
    - Middle Right: Defense (Blue)
    - Bottom Right: HP (Green)
  - Font size and positioning are optimized to fit within the tile.

### Player Stats
- **Properties**:
  - **HP**: Max 100, Current 100.
  - **Attack**: 1.
  - **Defense**: Max 10, Current 10.
  - **Coins**: 0.
  - **Equipment Points**: 0.
  - **Experience**: 0.
  - `InputHandler.ts`: Handles mouse/touch events for the drag mechanic.
- `src/style.css`: Global styles, grid layout, and animations.

## Next Steps
1.  **Game Over Logic**: End game when HP reaches 0.
2.  **Skills/Upgrades**: Add active skills and leveling up.
3.  **Sound Effects**: Add audio feedback.
4.  **Scoring System**: Implement logic to calculate score based on chain length and tile type.

## Development Notes
- **Tile Positioning**: Tiles use absolute positioning (`top`, `left`) to enable smooth CSS transitions for falling animations.
- **Z-Index**: The connection line SVG layer has a high z-index to appear on top of opaque tiles (Sword/Enemy).
- **Potions**: +1 HP per tile, capped at Max HP.
- **Shields**: +1 Defense per tile, capped at Max Defense. Overflow adds to Equipment Points.
- **Experience**: +1 EXP per killed Enemy.

### Enemy Attack Logic (Turn-Based)
- **Timing**: Occurs after player's turn (tile removal and falling) is processed.
- **Attackers**: All enemies that existed on the board **before** the new tiles fell (i.e., survivors). Newly spawned enemies do not attack immediately.
- **Damage Formula**: `Damage = max(0, Enemy Attack - Player Defense)`. (No minimum 1 damage rule).
- **Defense Degradation**: Player Defense decreases by **1** after **each** enemy attack (min 0).
- **Sequential Processing**: Attacks are processed one by one. Defense updates apply immediately for the next enemy's attack calculation.

### Enemy Stats (Debug)
- **HP**: Initialized to 3 ± 1 (temporarily reduced from 10 ± 1 for testing).
- **Attack/Defense**: Initialized to 5 ± 1 (temporarily reduced from 10 ± 1 for testing).
- **Overflow**: The grid container has `overflow: hidden` to clip tiles falling from above.
- **Documentation Maintenance**: This `CONTEXT.md` file MUST be updated whenever specifications are added or modified to ensure it remains the single source of truth for the project state.
