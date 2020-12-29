import { IHero } from "../interfaces/IHero";

export class HeroesData {
    public static readonly paragon: IHero = {
        id: "paragon",
        maxEnergy: 12,
        maxHealth: 20,
        maxMana: 12,
        primaryWeapons: [
            {
                name: "spear 1",
                level: 1,
                range: 2,
                energyCost: 3,
                physDamage: 2
            },
            {
                name: "spear 2",
                level: 2,
                range: 2,
                cost: 1,
                energyCost: 3,
                strength: 1,
                physDamage: 3
            },
            {
                name: "spear 3",
                level: 3,
                range: 2,
                cost: 1,
                energyCost: 3,
                strength: 2,
                physDamage: 4
            }
        ],
        secondaryWeapons: [
            {
                name: "shield 1",
                level: 1,
                armor: 1
            },
            {
                name: "shield 2",
                level: 2,
                cost: 1,
                armor: 1,
                will: 1,
                mind: 1
            },
            {
                name: "shield 3",
                level: 3,
                cost: 1,
                strength: 1,
                armor: 2,
                will: 1,
                mind: 1
            }
        ],
        chestpieces: [
            {
                name: "armor 1",
                level: 1,
                armor: 2,
                will: 2
            },
            {
                name: "armor 2",
                level: 2,
                cost: 1,
                strength: 1,
                armor: 3,
                will: 2
            },
            {
                name: "armor 3",
                level: 3,
                cost: 1,
                strength: 1,
                armor: 3,
                will: 2,
                regeneration: 1
            }
        ]
    };

    public static readonly oracle: IHero = {
        id: "oracle",
        maxEnergy: 12,
        maxHealth: 12,
        maxMana: 20,
        primaryWeapons: [
            {
                name: "book 1",
                level: 1,
                range: 3,
                energyCost: 3,
                intellect: 1,
                magicDamage: 1
            },
            {
                name: "book 2",
                level: 2,
                range: 3,
                cost: 2,
                energyCost: 3,
                intellect: 2,
                will: 1,
                mind: 1,
                magicDamage: 2
            },
            {
                name: "book 3",
                level: 3,
                range: 3,
                cost: 2,
                energyCost: 3,
                intellect: 3,
                will: 2,
                mind: 2,
                magicDamage: 3
            }
        ],
        chestpieces: [
            {
                name: "armor 1",
                level: 1,
                intellect: 1,
                armor: 1,
                will: 2
            },
            {
                name: "armor 2",
                level: 2,
                cost: 1,
                intellect: 1,
                armor: 2,
                will: 3
            },
            {
                name: "armor 3",
                level: 3,
                cost: 1,
                intellect: 2,
                armor: 3,
                will: 3
            }
        ]
    }
}