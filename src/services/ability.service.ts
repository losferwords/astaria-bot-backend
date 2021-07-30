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
    if ((target as IHero).isDead) {
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

    this.battleService.charge(battle, target.position, caster, isSimulation);
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

    this.battleService.knockBack(battle, target, caster.position, isSimulation);
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

    this.battleService.charge(battle, target.position, caster, isSimulation);
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

    this.battleService.charge(battle, caster.position, target, isSimulation);
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

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: 4,
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

    this.battleService.knockBack(battle, target, caster.position, isSimulation);
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
    for (let i = target.effects.length - 1; i >= 0; i--) {
      if (target.effects[i].isRemovable && target.effects[i].isBuff) {
        caster.effects.push(target.effects[i]);
        this.battleService.applyEffect(battle, heroes, caster, target.effects[i], false, isSimulation);
        target.effects.splice(i, 1);
      }
    }

    if (target.isPet) {
      target = this.heroService.resetPetState(target as IPet);
      target = this.heroService.calcPet(target as IPet);
    } else {
      target = this.heroService.resetHeroState(target as IHero);
      target = this.heroService.calcHero(target as IHero);
    }
    this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);

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
}
