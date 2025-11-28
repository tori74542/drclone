import { Player } from './Player';
import { Grid } from './Grid';

export interface UpgradeContext {
    player: Player;
    grid: Grid;
}

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    type: 'coin' | 'equipment' | 'experience';
    weight: number;
    effect: (context: UpgradeContext) => void;
}

export const UPGRADES: Upgrade[] = [
    // --- COIN UPGRADES ---
    {
        id: 'upgrade_weapon',
        name: 'Upgrade Weapon',
        description: 'Add 1 to weapon attack.',
        type: 'coin',
        weight: 10,
        effect: ({ player }) => {
            player.weaponAttack += 1;
            console.log('Effect: Upgrade Weapon (Weapon Attack +1)');
        }
    },
    {
        id: 'upgrade_shield',
        name: 'Upgrade Shield',
        description: 'Add 1 to shield value.',
        type: 'coin',
        weight: 10,
        effect: ({ player }) => {
            player.shieldValue += 1;
            console.log('Effect: Upgrade Shield (Shield Value +1)');
        }
    },
    {
        id: 'upgrade_hp',
        name: 'Upgrade HP',
        description: 'Add 5 to max HP.',
        type: 'coin',
        weight: 10,
        effect: ({ player }) => {
            player.maxHp += 5;
            console.log('Effect: Upgrade HP (Max HP +5)');
        }
    },
    {
        id: 'skill_fireball',
        name: 'Fireball',
        description: 'Get fireball skill.',
        type: 'coin',
        weight: 10,
        effect: ({ player }) => {
            player.addSkill('fireball');
            console.log('Effect: Fireball (Skill added)');
        }
    },
    // {
    //     id: 'coin_alchemist',
    //     name: 'Alchemist',
    //     description: 'Turn all currently visible enemy tiles into potion tiles.',
    //     type: 'coin',
    //     weight: 5,
    //     effect: ({ grid }) => {
    //         let count = 0;
    //         for (let y = 0; y < grid.height; y++) {
    //             for (let x = 0; x < grid.width; x++) {
    //                 const tile = grid.getTile(x, y);
    //                 if (tile && tile.type === TileType.Enemy) {
    //                     tile.type = TileType.Potion;
    //                     // Reset stats since it's no longer an enemy
    //                     tile.stats = undefined;
    //                     // Update the DOM element immediately
    //                     const tileEl = document.getElementById(`tile-${tile.id}`);
    //                     if (tileEl) {
    //                         tileEl.className = `tile ${TileType.Potion}`;
    //                         tileEl.innerHTML = tile.getIcon();
    //                     }
    //                     count++;
    //                 }
    //             }
    //         }
    //         console.log(`Effect: Alchemist (Converted ${count} enemies to potions)`);
    //     }
    // },

    // --- EQUIPMENT UPGRADES ---
    {
        id: 'max_defense',
        name: 'Max Defense',
        description: 'Increase Max Defense by 1.',
        type: 'equipment',
        weight: 10,
        effect: ({ player }) => {
            player.maxDefense += 1;
            console.log('Effect: Max Defense (Max Defense +1)');
        }
    },
    {
        id: 'base_power',
        name: 'Base Power',
        description: 'Increase Base Attack by 1.',
        type: 'equipment',
        weight: 10,
        effect: ({ player }) => {
            player.baseAttack += 1;
            console.log('Effect: Base Power (Base Attack +1)');
        }
    },

    // --- EXPERIENCE UPGRADES ---
    {
        id: 'exp_wisdom',
        name: 'Wisdom',
        description: 'Gain 10 Experience instantly.',
        type: 'experience',
        weight: 20,
        effect: ({ player }) => {
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
        effect: ({ player }) => {
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
        effect: ({ player }) => {
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
        effect: () => {
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
        effect: () => {
            // TODO: Implement revive logic
            console.log('Effect: Second Wind (Not implemented)');
        }
    }
];
