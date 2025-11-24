import { Player } from './Player';
import { Grid } from './Grid';
import { TileType } from './Tile';

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    type: 'coin' | 'equipment' | 'experience';
    weight: number;
    effect: (player: Player, grid: Grid) => void;
}

export const UPGRADES: Upgrade[] = [
    // --- COIN UPGRADES ---
    {
        id: 'coin_wealth',
        name: 'Sudden Wealth',
        description: 'Instantly gain 50 coins.',
        type: 'coin',
        weight: 20,
        effect: (player, grid) => {
            player.addCoins(50);
            console.log('Effect: Sudden Wealth (+50 Coins)');
        }
    },
    {
        id: 'coin_pocket',
        name: 'Deep Pockets',
        description: 'Increase max coins by 10.',
        type: 'coin',
        weight: 15,
        effect: (player, grid) => {
            player.maxCoins += 10;
            console.log('Effect: Deep Pockets (Max Coins +10)');
        }
    },
    {
        id: 'coin_greed',
        name: 'Greed',
        description: 'Coin tiles appear slightly more often.',
        type: 'coin',
        weight: 10,
        effect: (player, grid) => {
            // TODO: Implement spawn rate modification
            console.log('Effect: Greed (Not implemented)');
        }
    },
    {
        id: 'coin_interest',
        name: 'Compound Interest',
        description: 'Gain 1 coin for every 10 coins you currently have.',
        type: 'coin',
        weight: 10,
        effect: (player, grid) => {
            const interest = Math.floor(player.coins / 10);
            player.addCoins(interest);
            console.log(`Effect: Compound Interest (+${interest} Coins)`);
        }
    },
    {
        id: 'coin_alchemist',
        name: 'Alchemist',
        description: 'Turn all currently visible enemy tiles into potion tiles.',
        type: 'coin',
        weight: 5,
        effect: (player, grid) => {
            let count = 0;
            for (let y = 0; y < grid.height; y++) {
                for (let x = 0; x < grid.width; x++) {
                    const tile = grid.getTile(x, y);
                    if (tile && tile.type === TileType.Enemy) {
                        tile.type = TileType.Potion;
                        // Reset stats since it's no longer an enemy
                        tile.stats = undefined;
                        // Update the DOM element immediately
                        const tileEl = document.getElementById(`tile-${tile.id}`);
                        if (tileEl) {
                            tileEl.className = `tile ${TileType.Potion}`;
                            tileEl.innerHTML = tile.getIcon();
                        }
                        count++;
                    }
                }
            }
            console.log(`Effect: Alchemist (Converted ${count} enemies to potions)`);
        }
    },

    // --- EQUIPMENT UPGRADES ---
    {
        id: 'eq_sharpen',
        name: 'Sharpen Blade',
        description: 'Increase Weapon Attack by 1.',
        type: 'equipment',
        weight: 20,
        effect: (player, grid) => {
            player.weaponAttack += 1;
            console.log('Effect: Sharpen Blade (Weapon Attack +1)');
        }
    },
    {
        id: 'eq_reinforce',
        name: 'Reinforce Armor',
        description: 'Increase Max Defense by 2.',
        type: 'equipment',
        weight: 15,
        effect: (player, grid) => {
            player.maxDefense += 2;
            console.log('Effect: Reinforce Armor (Max Defense +2)');
        }
    },
    {
        id: 'eq_training',
        name: 'Basic Training',
        description: 'Increase Base Attack by 1.',
        type: 'equipment',
        weight: 10,
        effect: (player, grid) => {
            player.baseAttack += 1;
            console.log('Effect: Basic Training (Base Attack +1)');
        }
    },
    {
        id: 'eq_repair',
        name: 'Quick Repair',
        description: 'Fully restore current Defense.',
        type: 'equipment',
        weight: 10,
        effect: (player, grid) => {
            player.currentDefense = player.maxDefense;
            console.log('Effect: Quick Repair (Defense Restored)');
        }
    },
    {
        id: 'eq_mastery',
        name: 'Sword Mastery',
        description: 'Sword tiles deal +1 extra damage.',
        type: 'equipment',
        weight: 5,
        effect: (player, grid) => {
            // TODO: Implement damage modifier logic
            console.log('Effect: Sword Mastery (Not implemented)');
        }
    },

    // --- EXPERIENCE UPGRADES ---
    {
        id: 'exp_wisdom',
        name: 'Wisdom',
        description: 'Gain 10 Experience instantly.',
        type: 'experience',
        weight: 20,
        effect: (player, grid) => {
            player.addExperience(10);
            console.log('Effect: Wisdom (+10 Exp)');
        }
    },
    {
        id: 'exp_vitality',
        name: 'Vitality',
        description: 'Increase Max HP by 5.',
        type: 'experience',
        weight: 15,
        effect: (player, grid) => {
            player.maxHp += 5;
            player.currentHp += 5; // Heal the amount gained? Usually yes.
            console.log('Effect: Vitality (Max HP +5)');
        }
    },
    {
        id: 'exp_recovery',
        name: 'Recovery',
        description: 'Heal 20 HP.',
        type: 'experience',
        weight: 15,
        effect: (player, grid) => {
            player.currentHp = Math.min(player.maxHp, player.currentHp + 20);
            console.log('Effect: Recovery (+20 HP)');
        }
    },
    {
        id: 'exp_learning',
        name: 'Fast Learner',
        description: 'Reduce Experience needed for next level by 10%.',
        type: 'experience',
        weight: 10,
        effect: (player, grid) => {
            // TODO: Implement max experience modification
            console.log('Effect: Fast Learner (Not implemented)');
        }
    },
    {
        id: 'exp_secondwind',
        name: 'Second Wind',
        description: 'If HP drops to 0, survive with 1 HP (Once per game).',
        type: 'experience',
        weight: 5,
        effect: (player, grid) => {
            // TODO: Implement revive logic
            console.log('Effect: Second Wind (Not implemented)');
        }
    }
];
