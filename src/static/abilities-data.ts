import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IAbility } from 'src/interfaces/IAbility';

export class AbilitiesData {
  public static readonly paragon: IAbility[] = [
    {
      id: '11-sunder-armor',
      level: 1,
      range: 1,
      cd: 3,
      energyCost: 6,
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
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '21-spear-throw',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 7,
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
      cd: 3,
      energyCost: 1,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY_NOT_ME,
      includeInvisible: true
    },
    {
      id: '31-assault',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 7,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '32-no-step-back',
      level: 3,
      range: 0,
      cd: 4,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '33-bandaging',
      level: 3,
      range: 1,
      cd: 3,
      energyCost: 4,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '41-piercing-strike',
      level: 4,
      range: 2,
      cd: 5,
      energyCost: 9,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '42-breakthrough',
      level: 4,
      range: 1,
      cd: 3,
      energyCost: 7,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '43-rallying',
      level: 4,
      range: 3,
      cd: 4,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY_NOT_ME,
      includeInvisible: true
    }
  ];

  public static readonly highlander: IAbility[] = [
    {
      id: '11-heavy-strike',
      level: 1,
      range: 1,
      cd: 3,
      energyCost: 4,
      manaCost: 2,
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
      cd: 3,
      energyCost: 7,
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
      cd: 4,
      energyCost: 0,
      manaCost: 2,
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
      cd: 2,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '31-halving',
      level: 3,
      range: 1,
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
      id: '32-thunderer',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 5,
      manaCost: 5,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '33-lightning-strike',
      level: 3,
      range: 3,
      cd: 2,
      energyCost: 2,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY,
      ignoreRaytrace: true
    },
    {
      id: '41-decapitation',
      level: 4,
      range: 1,
      cd: 4,
      energyCost: 6,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '42-ancestral-power',
      level: 4,
      range: 3,
      cd: 4,
      energyCost: 5,
      manaCost: 5,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '43-chain-lightning',
      level: 4,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 4,
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
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '12-poison-touch',
      level: 1,
      range: 2,
      cd: 3,
      energyCost: 2,
      manaCost: 3,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '13-wound-healing',
      level: 1,
      range: 4,
      cd: 3,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '21-entangling-roots',
      level: 2,
      range: 2,
      cd: 3,
      energyCost: 3,
      manaCost: 3,
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
      energyCost: 0,
      manaCost: 2,
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
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '31-choking-vine',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '32-war-tree',
      level: 3,
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
      id: '33-power-of-the-pack',
      level: 3,
      range: 4,
      cd: 3,
      energyCost: 1,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '41-wrath-of-nature',
      level: 4,
      range: 0,
      cd: 3,
      energyCost: 4,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '42-dryad',
      level: 4,
      range: 1,
      cd: 0,
      energyCost: 4,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP
    },
    {
      id: '43-symbiosis',
      level: 4,
      range: 100,
      cd: 3,
      energyCost: 1,
      manaCost: 1,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY_NOT_ME,
      ignoreRaytrace: true,
      includeInvisible: true
    }
  ];

  public static readonly oracle: IAbility[] = [
    {
      id: '11-kinetic-impact',
      level: 1,
      range: 3,
      cd: 2,
      energyCost: 2,
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
      energyCost: 1,
      manaCost: 1,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY,
      ignoreRaytrace: true
    },
    {
      id: '21-mind-blow',
      level: 2,
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
      id: '22-knowledge-steal',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '23-paranoia',
      level: 2,
      range: 3,
      cd: 2,
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '31-disruption',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 9,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '32-teleportation',
      level: 3,
      range: 4,
      cd: 2,
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MOVE,
      ignoreRaytrace: true
    },
    {
      id: '33-mind-control',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '41-void-vortex',
      level: 4,
      range: 3,
      cd: 4,
      energyCost: 6,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP,
      ignoreObstacles: true
    },
    {
      id: '42-castling',
      level: 4,
      range: 100,
      cd: 1,
      energyCost: 0,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY_OR_ENEMY_NOT_ME,
      ignoreRaytrace: true,
      includeInvisible: true
    },
    {
      id: '43-amnesia',
      level: 4,
      range: 3,
      cd: 3,
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  ];

  public static readonly avatar: IAbility[] = [
    {
      id: '11-furious-strike',
      level: 1,
      range: 1,
      cd: 2,
      energyCost: 1,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '12-flame-dash',
      level: 1,
      range: 3,
      cd: 2,
      energyCost: 0,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ALLY_OR_ENEMY_NOT_ME,
      includeInvisible: true
    },
    {
      id: '13-fireball',
      level: 1,
      range: 3,
      cd: 3,
      energyCost: 1,
      manaCost: 1,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '21-flame-claws',
      level: 2,
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
      id: '22-cauterization',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 1,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY,
      includeInvisible: true
    },
    {
      id: '23-scorch',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 1,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '31-dragon-tail',
      level: 3,
      range: 1,
      cd: 3,
      energyCost: 5,
      manaCost: 2,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '32-elements-control',
      level: 3,
      range: 0,
      cd: 2,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '33-meteor',
      level: 3,
      range: 3,
      cd: 2,
      energyCost: 5,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '41-harmony',
      level: 4,
      range: 0,
      cd: 3,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '42-dragon-spirit',
      level: 4,
      range: 1,
      cd: 0,
      energyCost: 4,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP
    },
    {
      id: '43-fire',
      level: 4,
      range: 3,
      cd: 4,
      energyCost: 6,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP,
      ignoreObstacles: true
    }
  ];

  public static readonly shadow: IAbility[] = [
    {
      id: '11-aimed-shot',
      level: 1,
      range: 4,
      cd: 2,
      energyCost: 6,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '12-heavy-shot',
      level: 1,
      range: 3,
      cd: 2,
      energyCost: 4,
      manaCost: 1,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '13-debilitating-shot',
      level: 1,
      range: 3,
      cd: 3,
      energyCost: 3,
      manaCost: 3,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '21-rapid-fire',
      level: 2,
      range: 0,
      cd: 2,
      energyCost: 4,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '22-cat-hook',
      level: 2,
      range: 4,
      cd: 1,
      energyCost: 2,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.MOVE
    },
    {
      id: '23-blind',
      level: 2,
      range: 3,
      cd: 4,
      energyCost: 4,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '31-volley',
      level: 3,
      range: 0,
      cd: 3,
      energyCost: 6,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '32-shadow-cloak',
      level: 3,
      range: 0,
      cd: 5,
      energyCost: 3,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '33-dark-shot',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 6,
      manaCost: 3,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '41-headshot',
      level: 4,
      range: 3,
      cd: 3,
      energyCost: 8,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '42-phantom',
      level: 4,
      range: 1,
      cd: 0,
      energyCost: 4,
      manaCost: 5,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP
    },
    {
      id: '43-oblivion',
      level: 4,
      range: 3,
      cd: 4,
      energyCost: 4,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    }
  ];

  public static readonly lightbringer: IAbility[] = [
    {
      id: '11-sun-strike',
      level: 1,
      range: 2,
      cd: 2,
      energyCost: 5,
      manaCost: 2,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY,
      ignoreRaytrace: true
    },
    {
      id: '12-skies-gift',
      level: 1,
      range: 3,
      cd: 2,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MOVE,
      ignoreRaytrace: true
    },
    {
      id: '13-sun-touch',
      level: 1,
      range: 3,
      cd: 2,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY_OR_ENEMY,
      includeInvisible: true
    },
    {
      id: '21-aura-of-might',
      level: 2,
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
      id: '22-aura-of-fortitude',
      level: 2,
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
      id: '23-aura-of-light',
      level: 2,
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
      id: '31-retribution',
      level: 3,
      range: 1,
      cd: 2,
      energyCost: 4,
      manaCost: 5,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '32-sun-aegis',
      level: 3,
      range: 0,
      cd: 3,
      energyCost: 3,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '33-cleansing',
      level: 3,
      range: 3,
      cd: 2,
      energyCost: 1,
      manaCost: 3,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ALLY_OR_ENEMY,
      includeInvisible: true
    },
    {
      id: '41-hammer-of-wrath',
      level: 4,
      range: 1,
      cd: 3,
      energyCost: 6,
      manaCost: 3,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '42-divine-radiance',
      level: 4,
      range: 0,
      cd: 4,
      energyCost: 0,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '43-sunrise',
      level: 4,
      range: 0,
      cd: 3,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    }
  ];

  public static readonly avenger: IAbility[] = [
    {
      id: '11-double-strike',
      level: 1,
      range: 1,
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
      id: '12-desert-revenge',
      level: 1,
      range: 1,
      cd: 2,
      energyCost: 5,
      manaCost: 2,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '13-fit-of-energy',
      level: 1,
      range: 0,
      cd: 3,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '21-precise-strike',
      level: 2,
      range: 1,
      cd: 3,
      energyCost: 8,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '22-quicksands',
      level: 2,
      range: 3,
      cd: 3,
      energyCost: 2,
      manaCost: 2,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY,
      ignoreRaytrace: true
    },
    {
      id: '23-temporal-strike',
      level: 2,
      range: 1,
      cd: 4,
      energyCost: 5,
      manaCost: 3,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '31-blade-storm',
      level: 3,
      range: 0,
      cd: 3,
      energyCost: 8,
      manaCost: 0,
      isPassive: false,
      needWeapon: true,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '32-sand-storm',
      level: 3,
      range: 3,
      cd: 3,
      energyCost: 4,
      manaCost: 4,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.MAP,
      ignoreObstacles: true
    },
    {
      id: '33-time-trap',
      level: 3,
      range: 3,
      cd: 4,
      energyCost: 5,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.ENEMY
    },
    {
      id: '41-excellence',
      level: 4,
      range: 0,
      cd: 4,
      energyCost: 4,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: false,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '42-sand-form',
      level: 4,
      range: 0,
      cd: 5,
      energyCost: 9,
      manaCost: 6,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    },
    {
      id: '43-sands-of-time',
      level: 4,
      range: 0,
      cd: 2,
      energyCost: 0,
      manaCost: 0,
      isPassive: false,
      needWeapon: false,
      isSpell: true,
      left: 0,
      targetType: AbilityTargetType.SELF
    }
  ];
}
