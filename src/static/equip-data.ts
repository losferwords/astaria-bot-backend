import { IEquipData } from 'src/interfaces/IEquipData';

export class EquipData {
  static readonly paragon: IEquipData = {
    primaryWeapons: [
      {
        id: 'spear-1',
        level: 1,
        range: 1,
        energyCost: 3,
        physDamage: 2,
        strength: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'spear-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 3,
        physDamage: 3,
        strength: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'spear-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 3,
        physDamage: 4,
        strength: 3,
        isPassive: false,
        isUsed: false
      }
    ],
    secondaryWeapons: [
      {
        id: 'shield-1',
        level: 1,
        armor: 1,
        isPassive: true
      },
      {
        id: 'shield-2',
        level: 2,
        cost: 1,
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'shield-3',
        level: 3,
        cost: 1,
        armor: 2,
        will: 1,
        regeneration: 1,
        isPassive: true
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 1,
        armor: 2,
        will: 2,
        mind: 1,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 1,
        armor: 4,
        will: 3,
        mind: 1,
        isPassive: true
      }
    ]
  };

  static readonly highlander: IEquipData = {
    primaryWeapons: [
      {
        id: 'sword-1',
        level: 1,
        range: 1,
        energyCost: 4,
        physDamage: 4,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'sword-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 4,
        physDamage: 5,
        strength: 1,
        intellect: 1,
        mind: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'sword-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 4,
        physDamage: 6,
        strength: 3,
        intellect: 2,
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
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 2,
        armor: 3,
        will: 2,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 2,
        armor: 5,
        will: 3,
        isPassive: true
      }
    ]
  };

  static readonly druid: IEquipData = {
    primaryWeapons: [
      {
        id: 'staff-1',
        level: 1,
        range: 1,
        energyCost: 2,
        physDamage: 2,
        strength: 1,
        intellect: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'staff-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 3,
        strength: 2,
        intellect: 2,
        will: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'staff-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 4,
        strength: 2,
        intellect: 3,
        will: 1,
        regeneration: 1,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        intellect: 1,
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        intellect: 1,
        armor: 3,
        will: 2,
        mind: 1,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 1,
        intellect: 1,
        armor: 4,
        will: 3,
        mind: 1,
        isPassive: true
      }
    ]
  };

  static readonly oracle: IEquipData = {
    primaryWeapons: [
      {
        id: 'book-1',
        level: 1,
        range: 3,
        energyCost: 3,
        magicDamage: 1,
        intellect: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'book-2',
        level: 2,
        range: 3,
        cost: 1,
        energyCost: 3,
        magicDamage: 2,
        intellect: 2,
        will: 1,
        mind: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'book-3',
        level: 3,
        range: 3,
        cost: 1,
        energyCost: 3,
        magicDamage: 3,
        intellect: 3,
        will: 2,
        mind: 2,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        intellect: 1,
        armor: 1,
        will: 2,
        mind: 0,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        intellect: 2,
        armor: 2,
        will: 3,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        intellect: 3,
        armor: 3,
        will: 4,
        isPassive: true
      }
    ]
  };

  static readonly avatar: IEquipData = {
    primaryWeapons: [
      {
        id: 'bracers-1',
        level: 1,
        range: 1,
        energyCost: 2,
        physDamage: 1,
        strength: 1,
        intellect: 1,
        mind: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'bracers-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 2,
        strength: 2,
        intellect: 2,
        mind: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'bracers-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 3,
        strength: 3,
        intellect: 3,
        will: 1,
        mind: 2,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        intellect: 1,
        armor: 1,
        will: 2,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 1,
        intellect: 1,
        armor: 2,
        will: 3,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 1,
        intellect: 2,
        armor: 3,
        will: 4,
        mind: 0,
        isPassive: true
      }
    ]
  };

  static readonly shadow: IEquipData = {
    primaryWeapons: [
      {
        id: 'bow-1',
        level: 1,
        range: 3,
        energyCost: 4,
        physDamage: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'bow-2',
        level: 2,
        range: 3,
        cost: 1,
        energyCost: 4,
        physDamage: 3,
        strength: 1,
        intellect: 1,
        will: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'bow-3',
        level: 3,
        range: 3,
        cost: 1,
        energyCost: 4,
        physDamage: 4,
        strength: 2,
        intellect: 2,
        will: 2,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        strength: 1,
        armor: 1,
        will: 2,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 1,
        armor: 3,
        will: 2,
        mind: 1,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 1,
        intellect: 1,
        armor: 4,
        will: 3,
        mind: 1,
        isPassive: true
      }
    ]
  };

  static readonly lightbringer: IEquipData = {
    primaryWeapons: [
      {
        id: 'hammer-1',
        level: 1,
        range: 1,
        energyCost: 4,
        physDamage: 3,
        strength: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'hammer-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 4,
        physDamage: 4,
        strength: 2,
        intellect: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'hammer-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 4,
        physDamage: 5,
        strength: 3,
        intellect: 3,
        will: 1,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        intellect: 1,
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        intellect: 1,
        armor: 3,
        will: 2,
        mind: 1,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 1,
        intellect: 1,
        armor: 4,
        will: 3,
        mind: 1,
        isPassive: true
      }
    ]
  };

  static readonly avenger: IEquipData = {
    primaryWeapons: [
      {
        id: 'sabre-1',
        level: 1,
        range: 1,
        energyCost: 3,
        physDamage: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'sabre-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 3,
        physDamage: 3,
        armor: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'sabre-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 3,
        physDamage: 4,
        strength: 1,
        armor: 1,
        isPassive: false,
        isUsed: false
      }
    ],
    secondaryWeapons: [
      {
        id: 'blade-1',
        level: 1,
        range: 1,
        energyCost: 2,
        physDamage: 1,
        intellect: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'blade-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 2,
        intellect: 2,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'blade-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 3,
        intellect: 2,
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
        armor: 1,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 2,
        armor: 2,
        will: 2,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 2,
        intellect: 1,
        armor: 3,
        will: 3,
        isPassive: true
      }
    ]
  };

  static readonly navarch: IEquipData = {
    primaryWeapons: [
      {
        id: 'kopis-1',
        level: 1,
        range: 1,
        energyCost: 2,
        physDamage: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'kopis-2',
        level: 2,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 2,
        strength: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'kopis-3',
        level: 3,
        range: 1,
        cost: 1,
        energyCost: 2,
        physDamage: 3,
        strength: 2,
        isPassive: false,
        isUsed: false
      }
    ],
    secondaryWeapons: [
      {
        id: 'gun-1',
        level: 1,
        range: 3,
        energyCost: 3,
        directDamage: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'gun-2',
        level: 2,
        range: 3,
        cost: 1,
        energyCost: 3,
        directDamage: 2,
        will: 1,
        isPassive: false,
        isUsed: false
      },
      {
        id: 'gun-3',
        level: 3,
        range: 3,
        cost: 1,
        energyCost: 3,
        directDamage: 3,
        will: 1,
        mind: 1,
        isPassive: false,
        isUsed: false
      }
    ],
    chestpieces: [
      {
        id: 'armor-1',
        level: 1,
        armor: 2,
        will: 1,
        isPassive: true
      },
      {
        id: 'armor-2',
        level: 2,
        cost: 1,
        strength: 1,
        armor: 3,
        will: 2,
        isPassive: true
      },
      {
        id: 'armor-3',
        level: 3,
        cost: 1,
        strength: 2,
        armor: 4,
        will: 3,
        isPassive: true
      }
    ]
  };
}
