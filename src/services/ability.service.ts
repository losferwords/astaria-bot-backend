import * as rfdc from 'rfdc';
import { Injectable } from '@nestjs/common';
import { HeroService } from './hero.service';
import { IAbility } from 'src/interfaces/IAbility';
import { IHero } from 'src/interfaces/IHero';
import { IBattle } from 'src/interfaces/IBattle';
import { IPosition } from 'src/interfaces/IPosition';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IEffect } from 'src/interfaces/IEffect';
import { EffectsData } from 'src/static/effects-data';
import { BattleService } from './battle.service';
import { Pet } from 'src/models/Pet';
import { IChar } from 'src/interfaces/IChar';
import { IPet } from 'src/interfaces/IPet';

@Injectable()
export class AbilityService {
  constructor(private heroService: HeroService, private battleService: BattleService) {}

  addEffect(
    battle: IBattle,
    heroes: IHero[],
    target: IChar,
    effectId: string,
    casterId: string,
    isSimulation: boolean
  ): IEffect {
    if (!target || target.health < 1) {
      return;
    }
    const effect: IEffect = { ...EffectsData[effectId] };

    if (!effect.isBuff && target.isImmuneToDebuffs) {
      return undefined;
    }

    effect.left = effect.duration;
    effect.casterId = casterId;
    target.effects.push(effect);

    this.battleService.applyEffect(battle, heroes, target, effect, false, isSimulation);
    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return effect;
  }

  private spendResouces(caster: IHero, ability: IAbility) {
    this.heroService.spendEnergy(caster, ability.energyCost);
    this.heroService.spendMana(caster, ability.manaCost);

    ability.left = ability.cd;
  }

  castAbility(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IChar,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    return this[ability.id](battle, heroes, ability, caster, target, position, isSimulation);
  }

  // Paragon
  '11-sunder-armor'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 1,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-shield-bash'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.secondaryWeapon.level + 1 + caster.strength,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '13-shoulder-to-shoulder'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '21-spear-throw'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 1,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '23-defender'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-assault'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 2,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }
    this.battleService.charge(battle, heroes, target.position, caster, isSimulation);
    return battle;
  }

  '32-no-step-back'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    for (let i = target.effects.length - 1; i > -1; i--) {
      if (!target.effects[i].isBuff) {
        target.effects.splice(i, 1);
      }
    }

    target = this.heroService.resetHeroState(target as IHero);
    target = this.heroService.calcHero(target as IHero);
    this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-bandaging'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    target.health += 4;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_HEAL,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: '4'
    });

    return battle;
  }

  '41-piercing-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 3,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '42-breakthrough'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 3,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    this.battleService.knockBack(battle, heroes, target, caster.position, isSimulation);
    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '43-rallying'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: caster.position.x,
      y: caster.position.y
    };
    battle.mapEffects.push(rfdc({ proto: true })(effect));

    if (!target || target.health < 1) {
      return battle;
    }

    this.battleService.charge(battle, heroes, target.position, caster, isSimulation);
    return battle;
  }

  // Highlander
  '11-heavy-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-strong-grip'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '21-sweeping-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    const enemies = this.battleService.findEnemies(battle, caster.id, 2);
    for (let i = 0; i < enemies.length; i++) {
      if (caster.isDead) {
        return battle;
      }
      const enemyHero = this.heroService.getCharById(enemies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: enemyHero,
        abilityId: ability.id,
        physDamage: caster.primaryWeapon.physDamage + caster.strength + 1,
        isSimulation
      });
    }

    return battle;
  }

  '22-freedom-spirit'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    for (let i = target.effects.length - 1; i > -1; i--) {
      if (!target.effects[i].isBuff) {
        target.effects.splice(i, 1);
      }
    }

    target = this.heroService.resetHeroState(target as IHero);
    target = this.heroService.calcHero(target as IHero);
    this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '23-static-attraction'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 3 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    this.battleService.charge(battle, heroes, caster.position, target, isSimulation);
    return battle;
  }

  '31-halving'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 3,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '32-thunderer'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 1,
      magicDamage: 3 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-lightning-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 4 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '41-decapitation'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.strength + 4,
      abilityId: ability.id,
      isSimulation
    });

    if ((caster as IHero).isDead) {
      return battle;
    }

    if (!target || target.health < 1) {
      caster.health += 4;
      if (caster.health > caster.maxHealth) {
        caster.health = caster.maxHealth;
      }
      battle.log.push({
        type: LogMessageType.ABILITY_HEAL,
        casterId: caster.id,
        targetId: caster.id,
        abilityId: ability.id,
        value: '4'
      });

      this.heroService.takeMana(caster as IHero, 4);
      battle.log.push({
        id: caster.id,
        type: LogMessageType.TAKE_MANA,
        value: '4'
      });

      this.heroService.takeEnergy(caster as IHero, 4);
      battle.log.push({
        id: caster.id,
        type: LogMessageType.TAKE_ENERGY,
        value: '4'
      });
    } else {
      ability.left = 0;
    }

    return battle;
  }

  '42-ancestral-power'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '43-chain-lightning'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    const targetAllies = this.battleService.findAllies(battle, target.id, 2, false);
    for (let i = 0; i < targetAllies.length; i++) {
      const targetAlliesChar = this.heroService.getCharById(targetAllies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: targetAlliesChar,
        magicDamage: 3 + caster.intellect,
        abilityId: ability.id,
        isSimulation
      });
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 5 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  // Druid
  '11-crown-of-thorns'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-poison-touch'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1 + caster.strength,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '13-wound-healing'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '21-entangling-roots'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 2 + caster.strength,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '22-wolf'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.PET_SUMMON,
      casterId: caster.id,
      abilityId: 'wolf'
    });

    caster.pets.push(new Pet('wolf', position));
    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  '22-wolf-bite'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IPet,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    ability.left = ability.cd;

    let abilityDamage = 4;

    if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
      abilityDamage += 3;
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: abilityDamage,
      abilityId: ability.id,
      isSimulation
    });
    return battle;
  }

  '23-breath-of-life'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    target.health += 2;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_HEAL,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: '2'
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-choking-vine'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 4 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-power-of-the-pack'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    if (target.isPet) {
      target.health = target.maxHealth;
      for (let i = target.effects.length - 1; i > -1; i--) {
        if (!target.effects[i].isBuff) {
          target.effects.splice(i, 1);
        }
      }
    }

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '41-wrath-of-nature'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    const enemies = this.battleService.findEnemies(battle, caster.id, 3);
    for (let i = 0; i < enemies.length; i++) {
      const enemyChar = this.heroService.getCharById(enemies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: enemyChar,
        magicDamage: 5 + caster.intellect,
        abilityId: ability.id,
        isSimulation
      });

      if (!enemyChar || (!enemyChar.isPet && (enemyChar as IHero).isDead)) {
        continue;
      }
      this.battleService.knockBack(battle, heroes, enemyChar, caster.position, isSimulation);
    }

    return battle;
  }

  '42-dryad'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.PET_SUMMON,
      casterId: caster.id,
      abilityId: 'dryad'
    });

    caster.pets.push(new Pet('dryad', position));
    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  '42-dryad-forest-wrath'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IPet,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    ability.left = ability.cd;

    let abilityDamage = 7;

    if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
      abilityDamage += 3;
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: abilityDamage,
      abilityId: ability.id,
      isSimulation
    });

    if (!target.isPet) {
      this.heroService.spendMana(target as IHero, 3);
    }
    return battle;
  }

  '43-symbiosis'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    const halfHealth = Math.ceil((caster.health + target.health) / 2);

    target.health = halfHealth;
    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    caster.health = halfHealth;
    if (caster.health > caster.maxHealth) {
      caster.health = caster.maxHealth;
    }

    if (!target.isPet) {
      const halfMana = Math.ceil((caster.mana + (target as IHero).mana) / 2);

      (target as IHero).mana = halfMana;
      if ((target as IHero).mana > (target as IHero).maxMana) {
        (target as IHero).mana = (target as IHero).maxMana;
      }

      (caster as IHero).mana = halfMana;
      if ((caster as IHero).mana > (caster as IHero).maxMana) {
        (caster as IHero).mana = (caster as IHero).maxMana;
      }
    }

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  // Oracle
  '11-kinetic-impact'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    this.battleService.knockBack(battle, heroes, target, caster.position, isSimulation);
    return battle;
  }

  '13-dangerous-knowledge'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      directDamage: caster.intellect,
      abilityId: ability.id,
      isSimulation
    });
    return battle;
  }

  '21-mind-blow'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);
    let leftCounter = 0;

    if (target.isPet) {
      leftCounter += (target as IPet).ability.left;
    } else {
      for (let i = 0; i < (target as IHero).abilities.length; i++) {
        leftCounter += (target as IHero).abilities[i].left;
      }
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: caster.intellect * leftCounter,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '22-knowledge-steal'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let hasSymbiosis = false;
    for (let i = target.effects.length - 1; i >= 0; i--) {
      if (target.effects[i].isRemovable && target.effects[i].isBuff) {
        if (target.effects[i].id === '43-symbiosis') {
          hasSymbiosis = true;
        }
        caster.effects.push(target.effects[i]);
        this.battleService.applyEffect(battle, heroes, caster, target.effects[i], false, isSimulation);
        target.effects.splice(i, 1);
      }
    }

    if (hasSymbiosis) {
      for (let i = 0; i < heroes.length; i++) {
        heroes[i] = this.heroService.resetHeroState(heroes[i]);
        heroes[i] = this.heroService.calcHero(heroes[i]);
        this.battleService.applyCharEffects(battle, heroes, heroes[i], false, isSimulation);
      }
    } else {
      if (target.isPet) {
        target = this.heroService.resetPetState(target as IPet);
      } else {
        target = this.heroService.resetHeroState(target as IHero);
        target = this.heroService.calcHero(target as IHero);
      }
      this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);
    }

    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id
    });

    return battle;
  }

  '23-paranoia'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2 + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-disruption'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: Math.ceil(caster.mana / 2) + caster.intellect,
      abilityId: ability.id,
      isSimulation
    });

    this.heroService.spendMana(caster, Math.ceil(caster.mana / 2));
    return battle;
  }

  '32-teleportation'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      abilityId: ability.id,
      positionX: position.x,
      positionY: position.y
    });

    caster.position.x = position.x;
    caster.position.y = position.y;

    this.battleService.afterMoveChar(battle, heroes, caster, isSimulation);
    return battle;
  }

  '33-mind-control'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      abilityId: ability.id,
      targetId: target.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '41-void-vortex'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      abilityId: ability.id,
      positionX: position.x,
      positionY: position.y
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: position.x,
      y: position.y
    };
    battle.mapEffects.push(rfdc({ proto: true })(effect));
    return battle;
  }

  '42-castling'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    const targetPositionX = target.position.x;
    const targetPositionY = target.position.y;

    target.position.x = caster.position.x;
    target.position.y = caster.position.y;

    caster.position.x = targetPositionX;
    caster.position.y = targetPositionY;

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      abilityId: ability.id,
      targetId: target.id
    });

    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  '43-amnesia'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_CAST,
      casterId: caster.id,
      abilityId: ability.id,
      targetId: target.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }
}
