import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IPetData } from 'src/interfaces/IPetData';

export class PetsData {
  static readonly 'wolf': IPetData = {
    id: 'wolf',
    maxHealth: 6,
    ability: {
      id: '22-wolf-bite',
      level: 0,
      range: 1,
      cd: 1,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  };

  static readonly 'dryad': IPetData = {
    id: 'dryad',
    maxHealth: 8,
    ability: {
      id: '42-dryad-forest-wrath',
      level: 0,
      range: 3,
      cd: 1,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  };

  static readonly 'dragon-spirit': IPetData = {
    id: 'dragon-spirit',
    maxHealth: 8,
    ability: {
      id: '42-dragon-spirit-breath',
      level: 0,
      range: 3,
      cd: 1,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  };

  static readonly 'phantom': IPetData = {
    id: 'phantom',
    maxHealth: 8,
    ability: {
      id: '42-phantom-imitation-shot',
      level: 0,
      range: 3,
      cd: 1,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  };
}
