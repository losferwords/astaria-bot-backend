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
      id: '13-shoulder-to-shoulder',
      level: 1,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY
    },
    {
      id: '21-spear-throw',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 5,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '22-counterattack',
      level: 2,
      range: 0,
      cd: 0,
      energyCost: 0,
      manaCost: 0,
      isPassive: true,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '23-defender',
      level: 2,
      range: 3,
      cd: 4,
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY_NOT_ME
    }
  ];

  public static readonly highlander: IAbility[] = [
    {
      id: '11-heavy-strike',
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
    },
    {
      id: '21-sweeping-strike',
      level: 2,
      range: 0,
      cd: 2,
      energyCost: 5,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '22-freedom-spirit',
      level: 2,
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
      id: '23-static-attraction',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 5,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
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
      id: '13-wound-healing',
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
    },
    {
      id: '21-entangling-roots',
      level: 2,
      range: 2,
      cd: 2,
      energyCost: 4,
      manaCost: 2,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '22-wolf',
      level: 2,
      range: 1,
      cd: 0,
      energyCost: 4,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP
    },
    {
      id: '23-breath-of-life',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 3,
      manaCost: 4,
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
    },
    {
      id: '21-mind-blow',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 3,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '22-knowledge-steal',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 3,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '23-paranoia',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 3,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
  ];
}
