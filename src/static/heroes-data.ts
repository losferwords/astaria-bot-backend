import { IHero } from '../interfaces/IHero';

export class HeroesData {
    public static readonly paragon: IHero = {
        id: 'paragon',
        maxEnergy: 12,
        maxHealth: 20,
        maxMana: 12,
        primaryWeapons: [
            {
                name: 'spear 1',
                level: 1,
                range: 2,
                energyCost: 3,
                physDamage: 2,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'spear 2',
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
                mind: 0
            },
            {
                name: 'spear 3',
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
                mind: 0
            }
        ],
        secondaryWeapons: [
            {
                name: 'shield 1',
                level: 1,
                strength: 0,
                intellect: 0,
                armor: 1,
                will: 0,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'shield 2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 0,
                armor: 1,
                will: 1,
                regeneration: 0,
                mind: 1
            },
            {
                name: 'shield 3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 1
            }
        ],
        chestpieces: [
            {
                name: 'armor 1',
                level: 1,
                strength: 0,
                intellect: 0,
                armor: 2,
                will: 2,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 2',
                level: 2,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 3,
                will: 2,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 0,
                armor: 3,
                will: 2,
                regeneration: 1,
                mind: 0
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
                name: 'sword 1',
                level: 1,
                range: 1,
                energyCost: 4,
                physDamage: 4,
                strength: 0,
                intellect: 0,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'sword 2',
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
                mind: 1
            },
            {
                name: 'sword 3',
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
                mind: 1
            }
        ],
        chestpieces: [
            {
                name: 'armor 1',
                level: 1,
                strength: 1,
                intellect: 0,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 2',
                level: 2,
                cost: 1,
                strength: 2,
                intellect: 0,
                armor: 3,
                will: 1,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 3',
                level: 3,
                cost: 1,
                strength: 2,
                intellect: 0,
                armor: 4,
                will: 2,
                regeneration: 0,
                mind: 0
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
                name: 'staff 1',
                level: 1,
                range: 1,
                energyCost: 3,
                physDamage: 2,
                strength: 1,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'staff 2',
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
                mind: 0
            },
            {
                name: 'staff 3',
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
                mind: 0
            }
        ],
        chestpieces: [
            {
                name: 'armor 1',
                level: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 1,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 2,
                regeneration: 0,
                mind: 1
            },
            {
                name: 'armor 3',
                level: 3,
                cost: 1,
                strength: 1,
                intellect: 1,
                armor: 3,
                will: 2,
                regeneration: 0,
                mind: 1
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
                name: 'book 1',
                level: 1,
                range: 3,
                energyCost: 3,
                magicDamage: 1,
                strength: 0,
                intellect: 1,
                armor: 0,
                will: 0,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'book 2',
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
                mind: 1
            },
            {
                name: 'book 3',
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
                mind: 2
            }
        ],
        chestpieces: [
            {
                name: 'armor 1',
                level: 1,
                strength: 0,
                intellect: 1,
                armor: 1,
                will: 2,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 2',
                level: 2,
                cost: 1,
                strength: 0,
                intellect: 1,
                armor: 2,
                will: 3,
                regeneration: 0,
                mind: 0
            },
            {
                name: 'armor 3',
                level: 3,
                cost: 1,
                strength: 0,
                intellect: 2,
                armor: 3,
                will: 3,
                regeneration: 0,
                mind: 0
            }
        ]
    };
}
