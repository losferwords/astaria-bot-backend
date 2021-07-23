import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IPetData } from 'src/interfaces/IPetData';

export class PetsData {
  public static readonly 'wolf': IPetData = {
    id: 'wolf',
    maxHealth: 4,
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
}
