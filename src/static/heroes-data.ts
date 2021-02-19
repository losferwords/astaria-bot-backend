import { IHeroData } from '../interfaces/IHeroData';

export class HeroesData {
    public static readonly paragon: IHeroData = {
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
                // physDamage: 2,
                physDamage: 4,
                magicDamage: 0,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'spear-2',
                level: 2,
                range: 2,
                cost: 1,
                energyCost: 3,
                physDamage: 3,
                magicDamage: 0,
                strength: 1,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'spear-3',
                level: 3,
                range: 2,
                cost: 1,
                energyCost: 3,
                physDamage: 4,
                magicDamage: 0,
                strength: 2,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
            }
        ]
    };

    public static readonly highlander: IHeroData = {
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
                // physDamage: 4,
                physDamage: 8,
                magicDamage: 0,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'sword-2',
                level: 2,
                range: 1,
                cost: 2,
                energyCost: 4,
                physDamage: 5,
                magicDamage: 0,
                strength: 1,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 1,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'sword-3',
                level: 3,
                range: 1,
                cost: 2,
                energyCost: 4,
                physDamage: 6,
                magicDamage: 0,
                strength: 3,
                intellect: 2,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 1,
                isPassive: false,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
            }
        ]
    };

    public static readonly druid: IHeroData = {
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
                // physDamage: 2,
                physDamage: 4,
                magicDamage: 0,
                strength: 1,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'staff-2',
                level: 2,
                range: 1,
                cost: 2,
                energyCost: 3,
                physDamage: 3,
                magicDamage: 0,
                strength: 2,
                intellect: 2,
                armor: 0,
                will: 1,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'staff-3',
                level: 3,
                range: 1,
                cost: 2,
                energyCost: 3,
                physDamage: 4,
                magicDamage: 0,
                strength: 2,
                intellect: 3,
                armor: 0,
                will: 1,
                regeneration: 1,
                mind: 0,
                isPassive: false,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
            }
        ]
    };

    public static readonly oracle: IHeroData = {
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
                physDamage: 0,
                // magicDamage: 1,
                magicDamage: 2,
                strength: 0,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'book-2',
                level: 2,
                range: 3,
                cost: 2,
                energyCost: 3,
                physDamage: 0,
                magicDamage: 2,
                strength: 0,
                intellect: 2,
                armor: 0,
                will: 1,
                regeneration: 0,
                mind: 1,
                isPassive: false,
                isUsed: false
            },
            {
                id: 'book-3',
                level: 3,
                range: 3,
                cost: 2,
                energyCost: 3,
                physDamage: 0,
                magicDamage: 3,
                strength: 0,
                intellect: 3,
                armor: 0,
                will: 2,
                regeneration: 0,
                mind: 2,
                isPassive: false,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
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
                isPassive: true,
                isUsed: false
            }
        ]
    };
}
