export interface Skill {
    id: string;
    name: string;
    description: string;
    cooldownMax: number;
    cooldownCurrent: number;
    iconUrl: string; // Using SVG string for now for simplicity
    activate: () => void;
}

export class SkillRegistry {
    static getSkill(id: string): Skill | null {
        switch (id) {
            case 'fireball':
                return {
                    id: 'fireball',
                    name: 'Fireball',
                    description: 'Deals damage to enemies.',
                    cooldownMax: 5,
                    cooldownCurrent: 0,
                    iconUrl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c4.97 0 9-4.03 9-9c0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9z"/></svg>',
                    activate: () => console.log('Fireball activated!')
                };
            case 'heal':
                return {
                    id: 'heal',
                    name: 'Heal',
                    description: 'Restores HP.',
                    cooldownMax: 8,
                    cooldownCurrent: 0,
                    iconUrl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z"/></svg>',
                    activate: () => console.log('Heal activated!')
                };
            case 'freeze':
                return {
                    id: 'freeze',
                    name: 'Freeze',
                    description: 'Freezes enemies for a turn.',
                    cooldownMax: 6,
                    cooldownCurrent: 0,
                    iconUrl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
                    activate: () => console.log('Freeze activated!')
                };
            case 'slash':
                return {
                    id: 'slash',
                    name: 'Slash',
                    description: 'Attacks a row of enemies.',
                    cooldownMax: 3,
                    cooldownCurrent: 0,
                    iconUrl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.5 3.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 19V2l-1.5 1.5z"/></svg>',
                    activate: () => console.log('Slash activated!')
                };
            case 'shield_bash':
                return {
                    id: 'shield_bash',
                    name: 'Shield Bash',
                    description: 'Deals damage based on defense.',
                    cooldownMax: 4,
                    cooldownCurrent: 0,
                    iconUrl: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>',
                    activate: () => console.log('Shield Bash activated!')
                };
            default:
                return null;
        }
    }
}
