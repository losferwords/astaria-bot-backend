import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IAbility } from 'src/interfaces/IAbility';

export class AbilitiesData {
  public static readonly paragon: IAbility[] = [
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
      },
      {
        id: '12-shield-bash',
        level: 1,
        range: 1,
        cd: 2,
        energyCost: 4,
        manaCost: 0,
        isPassive: false,
        needWeapon: true,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      },
      {
        id: '13-shoulder-to-shoulder',
        level: 1,
        range: 3,
        cd: 2,
        energyCost: 2,
        manaCost: 2,
        isPassive: false,
        needWeapon: false,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.ALLY
      }
  ];

  public static readonly highlander: IAbility[] = [
      {
        id: '11-shoulder-punch',
        level: 1,
        range: 1,
        cd: 2,
        energyCost: 4,
        manaCost: 0,
        isPassive: false,
        needWeapon: true,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      },
      {
        id: '12-strong-grip',
        level: 1,
        range: 0,
        cd: 3,
        energyCost: 3,
        manaCost: 0,
        isPassive: false,
        needWeapon: false,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.SELF
      },
      {
        id: '13-lightning-rod',
        level: 1,
        range: 0,
        cd: 0,
        energyCost: 0,
        manaCost: 0,
        isPassive: true,
        needWeapon: false,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.SELF
      }
  ];

  public static readonly druid: IAbility[] = [
      {
        id: '11-crown-of-thorns',
        level: 1,
        range: 3,
        cd: 3,
        energyCost: 2,
        manaCost: 2,
        isPassive: false,
        needWeapon: false,
        isSpell: true,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      },
      {
        id: '12-poison-touch',
        level: 1,
        range: 1,
        cd: 3,
        energyCost: 3,
        manaCost: 1,
        isPassive: false,
        needWeapon: true,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      },
      {
        id: '13-healing-wounds',
        level: 1,
        range: 3,
        cd: 4,
        energyCost: 2,
        manaCost: 3,
        isPassive: false,
        needWeapon: false,
        isSpell: true,
        left: 0,
        targetType: AbilityTargetType.ALLY
      }
  ];

  public static readonly oracle: IAbility[] = [
      {
        id: '11-kinetic-impact',
        level: 1,
        range: 3,
        cd: 2,
        energyCost: 3,
        manaCost: 2,
        isPassive: false,
        needWeapon: false,
        isSpell: true,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      },
      {
        id: '12-reflection',
        level: 1,
        range: 0,
        cd: 0,
        energyCost: 0,
        manaCost: 0,
        isPassive: true,
        needWeapon: false,
        isSpell: false,
        left: 0,
        targetType: AbilityTargetType.SELF
      },
      {
        id: '13-dangerous-knowledge',
        level: 1,
        range: 3,
        cd: 2,
        energyCost: 2,
        manaCost: 3,
        isPassive: false,
        needWeapon: false,
        isSpell: true,
        left: 0,
        targetType: AbilityTargetType.ENEMY
      }
  ];
}
