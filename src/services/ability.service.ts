import * as _ from 'lodash';
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

@Injectable()
export class AbilityService {
  constructor(private heroService: HeroService, private battleService: BattleService) {}

  addEffect(
    battle: IBattle,
    heroes: IHero[],
    target: IHero,
    effectId: string,
    casterId: string,
    isSimulation: boolean
  ) {
    if (target.isDead) {
      return;
    }
    const effect: IEffect = { ...EffectsData[effectId] };
    effect.left = effect.duration;
    effect.casterId = casterId;
    target.effects.push(effect);
    this.battleService.applyEffect(battle, heroes, target, effect, false, isSimulation);
  }

  private spendResouces(caster: IHero, ability: IAbility) {
    this.heroService.spendEnergy(caster, ability.energyCost);
    this.heroService.spendMana(caster, ability.manaCost);

    ability.left = ability.cd;
  }

  castAbility(
    battle: IBattle,
    heroes: IHero[],
    abilityId: string,
    caster: IHero,
    targetId: string,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    const target: IHero = caster.id === targetId ? caster : this.heroService.getHeroById(targetId, heroes);
    const ability: IAbility = caster.abilities.find((ability: IAbility) => ability.id === abilityId);

    return this[ability.id](battle, heroes, ability, caster, target, position, isSimulation);
  }

  // Paragon
  '11-sunder-armor'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let physDamage = caster.primaryWeapon.physDamage + caster.strength + 1 - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: physDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, physDamage, isSimulation);
    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-shield-bash'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let physDamage = caster.primaryWeapon.physDamage + caster.strength + 1 - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: physDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, physDamage, isSimulation);
    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '13-shoulder-to-shoulder'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
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

  // Highlander
  '11-shoulder-punch'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let physDamage = caster.primaryWeapon.physDamage + caster.strength - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: physDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, physDamage, isSimulation);
    this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-strong-grip'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
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

  // Druid
  '11-crown-of-thorns'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let magicDamage = 2 + caster.intellect - target.will;
    if (magicDamage < 0) {
      magicDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: magicDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, magicDamage, isSimulation);
    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '12-poison-touch'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let physDamage = caster.primaryWeapon.physDamage + 1 + caster.strength - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: physDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, physDamage, isSimulation);
    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '13-healing-wounds'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
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

  // Oracle
  '11-kinetic-impact'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    let magicDamage = 2 + caster.intellect - target.will;
    if (magicDamage < 0) {
      magicDamage = 0;
    }

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: magicDamage + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, magicDamage, isSimulation);
    this.battleService.knockBack(battle, target, caster.position);
    return battle;
  }

  '13-dangerous-knowledge'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IHero,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(caster, ability);

    battle.log.push({
      type: LogMessageType.ABILITY_DAMAGE,
      casterId: caster.id,
      targetId: target.id,
      abilityId: ability.id,
      value: caster.intellect + ''
    });

    this.battleService.heroTakesDamage(battle, caster, target, caster.intellect, isSimulation);
    return battle;
  }
}
