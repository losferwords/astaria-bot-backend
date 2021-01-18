import { IHero } from '../interfaces/IHero';

export class HeroesData {
    public static readonly paragon: IHero = {
        id: 'paragon',
        maxEnergy: 12,
        maxHealth: 20,
        maxMana: 12,
        primaryWeapons: [
            {
                id: 'spear-1',
                level: 1,
                range: 2,
                energyCost: 3,
                physDamage: 2,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'spear-2',
                level: 2,
                range: 2,
                cost: 1,
                energyCost: 3,
                physDamage: 3,
                strength: 1,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'spear-3',
                level: 3,
                range: 2,
                cost: 1,
                energyCost: 3,
                physDamage: 4,
                strength: 2,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            }
        ],
        secondaryWeapons: [
            {
                id: 'shield-1',
                level: 1,
                strength: 0,
                intellect: 0,
                armor: 1,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'shield-2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 0,
                armor: 1,
                will: 1,
                regeneration: 0,
                mind: 1,
                isPassive: true
            },
            {
                id: 'shield-3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 1,
                isPassive: true
            }
        ],
        chestpieces: [
            {
                id: 'armor-1',
                level: 1,
                strength: 0,
                intellect: 0,
                armor: 2,
                will: 2,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-2',
                level: 2,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 3,
                will: 2,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 3,
                will: 2,
                regeneration: 1,
                mind: 0,
                isPassive: true
            }
        ]
    };

    public static readonly highlander: IHero = {
        id: 'highlander',
        maxEnergy: 10,
        maxHealth: 18,
        maxMana: 18,
        primaryWeapons: [
            {
                id: 'sword-1',
                level: 1,
                range: 1,
                energyCost: 4,
                physDamage: 4,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'sword-2',
                level: 2,
                range: 1,
                cost: 2,
                energyCost: 4,
                physDamage: 5,
                strength: 1,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 1,
                isPassive: false
            },
            {
                id: 'sword-3',
                level: 3,
                range: 1,
                cost: 2,
                energyCost: 4,
                physDamage: 6,
                strength: 3,
                intellect: 2,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 1,
                isPassive: false
            }
        ],
        chestpieces: [
            {
                id: 'armor-1',
                level: 1,
                strength: 1,
                intellect: 0,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-2',
                level: 2,
                cost: 1,
                strength: 2,
                intellect: 0,
                armor: 3,
                will: 1,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-3',
                level: 3,
                cost: 1,
                strength: 2,
                intellect: 0,
                armor: 4,
                will: 2,
                regeneration: 0,
                mind: 0,
                isPassive: true
            }
        ]
    };

    public static readonly druid: IHero = {
        id: 'druid',
        maxEnergy: 10,
        maxHealth: 16,
        maxMana: 20,
        primaryWeapons: [
            {
                id: 'staff-1',
                level: 1,
                range: 1,
                energyCost: 3,
                physDamage: 2,
                strength: 1,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'staff-2',
                level: 2,
                range: 1,
                cost: 2,
                energyCost: 3,
                physDamage: 3,
                strength: 2,
                intellect: 2,
                armor: 0,
                will: 1,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'staff-3',
                level: 3,
                range: 1,
                cost: 2,
                energyCost: 3,
                physDamage: 4,
                strength: 2,
                intellect: 3,
                armor: 0,
                will: 1,
                regeneration: 1,
                mind: 0,
                isPassive: false
            }
        ],
        chestpieces: [
            {
                id: 'armor-1',
                level: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 2,
                regeneration: 0,
                mind: 1,
                isPassive: true
            },
            {
                id: 'armor-3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 1,
                armor: 3,
                will: 2,
                regeneration: 0,
                mind: 1,
                isPassive: true
            }
        ]
    };

    public static readonly oracle: IHero = {
        id: 'oracle',
        maxEnergy: 12,
        maxHealth: 12,
        maxMana: 20,
        primaryWeapons: [
            {
                id: 'book-1',
                level: 1,
                range: 3,
                energyCost: 3,
                magicDamage: 1,
                strength: 0,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false
            },
            {
                id: 'book-2',
                level: 2,
                range: 3,
                cost: 2,
                energyCost: 3,
                magicDamage: 2,
                strength: 0,
                intellect: 2,
                armor: 0,
                will: 1,
                regeneration: 0,
                mind: 1,
                isPassive: false
            },
            {
                id: 'book-3',
                level: 3,
                range: 3,
                cost: 2,
                energyCost: 3,
                magicDamage: 3,
                strength: 0,
                intellect: 3,
                armor: 0,
                will: 2,
                regeneration: 0,
                mind: 2,
                isPassive: false
            }
        ],
        chestpieces: [
            {
                id: 'armor-1',
                level: 1,
                strength: 0,
                intellect: 1,
                armor: 1,
                will: 2,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 3,
                regeneration: 0,
                mind: 0,
                isPassive: true
            },
            {
                id: 'armor-3',
                level: 3,
                cost: 1,
                strength: 0,
                intellect: 2,
                armor: 3,
                will: 3,
                regeneration: 0,
                mind: 0,
                isPassive: true
            }
        ]
    };
}
