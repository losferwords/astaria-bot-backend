import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IAbility } from 'src/interfaces/IAbility';

export class AbilitiesData {
  public static readonly paragon: IAbility[][] = [
    [
      {
        id: '11-sunder-armor',
        level: 1,
        range: 2,
        cd: 3,
        energyCost: 4,
        manaCost: 0,
        isPassive: false,
        needWeapon: true,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      }
    ]
  ];
}
