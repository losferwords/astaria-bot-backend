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
      return undefined;
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

  private spendResouces(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ) {
    if (caster.id === 'avatar' && this.heroService.getCharEffectById(caster, '32-elements-control')) {
      for (let i = caster.effects.length - 1; i >= 0; i--) {
        if (caster.effects[i].id === '32-elements-control') {
          caster.effects.splice(i, 1);
          break;
        }
      }
      this.heroService.resetHeroState(caster);
      this.heroService.calcHero(caster);
      this.battleService.applyCharEffects(battle, heroes, caster, false, isSimulation);
    } else {
      this.heroService.spendEnergy(caster, ability.energyCost);
      this.heroService.spendMana(caster, ability.manaCost);
    }

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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.secondaryWeapon.level + 1,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charge(battle, heroes, target.position, caster, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      abilityId: ability.id,
      isSimulation
    });

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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    for (let i = target.effects.length - 1; i > -1; i--) {
      if (!target.effects[i].isBuff) {
        target.effects.splice(i, 1);
      }
    }

    this.heroService.resetHeroState(target as IHero);
    this.heroService.calcHero(target as IHero);
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    target.health += 4;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: target.id,
      a: ability.id,
      v: '4'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.secondaryWeapon.level + 4,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: caster.position.x,
      y: caster.position.y
    };
    battle.mapEffects.push(Object.assign({}, effect));

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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const enemies = this.battleService.findEnemies(battle, caster.id, 2, true, ability.id, false, false);
    for (let i = 0; i < enemies.length; i++) {
      if (caster.isDead) {
        return battle;
      }
      const enemyChar = this.heroService.getCharById(enemies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: enemyChar,
        abilityId: ability.id,
        physDamage: caster.primaryWeapon.physDamage,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    for (let i = target.effects.length - 1; i > -1; i--) {
      if (!target.effects[i].isBuff) {
        target.effects.splice(i, 1);
      }
    }

    this.heroService.resetHeroState(target as IHero);
    this.heroService.calcHero(target as IHero);
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 3,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 3,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      magicDamage: 2,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 4,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 3,
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
        t: LogMessageType.ABILITY_HEAL,
        c: caster.id,
        tr: caster.id,
        a: ability.id,
        v: '4'
      });

      this.heroService.takeMana(caster as IHero, 4);
      battle.log.push({
        id: caster.id,
        t: LogMessageType.TAKE_MANA,
        v: '4'
      });

      this.heroService.takeEnergy(caster as IHero, 4);
      battle.log.push({
        id: caster.id,
        t: LogMessageType.TAKE_ENERGY,
        v: '4'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const aoeEnemies = this.battleService.findEnemies(
      battle,
      caster.id,
      2,
      true,
      ability.id,
      false,
      false,
      target.position
    );

    for (let i = 0; i < aoeEnemies.length; i++) {
      if (aoeEnemies[i] !== target.id) {
        const aoeEnemiesChar = this.heroService.getCharById(aoeEnemies[i], heroes);
        this.battleService.charTakesDamage({
          battle,
          caster,
          heroes,
          target: aoeEnemiesChar,
          magicDamage: 4,
          abilityId: ability.id,
          isSimulation
        });
      }
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 5,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.PET_SUMMON,
      c: caster.id,
      a: 'wolf'
    });

    const newPet = new Pet('wolf', position);
    caster.pets.push(newPet);

    this.battleService.afterMoveChar(battle, heroes, newPet, isSimulation);
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    target.health += 2;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: target.id,
      a: ability.id,
      v: '2'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 3,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const enemies = this.battleService.findEnemies(battle, caster.id, 3, true, ability.id, false, false);
    for (let i = 0; i < enemies.length; i++) {
      const enemyChar = this.heroService.getCharById(enemies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: enemyChar,
        magicDamage: 5,
        abilityId: ability.id,
        isSimulation
      });

      if (!enemyChar || enemyChar.health < 1) {
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.PET_SUMMON,
      c: caster.id,
      a: 'dryad'
    });

    const newPet = new Pet('dryad', position);
    caster.pets.push(newPet);

    this.battleService.afterMoveChar(battle, heroes, newPet, isSimulation);
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

    let abilityDamage = 6;

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
      this.heroService.spendMana(target as IHero, 2);
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    target.health += 5;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    caster.health += 5;

    if (caster.health > caster.maxHealth) {
      caster.health = caster.maxHealth;
    }

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: target.id,
      a: ability.id,
      v: '5'
    });

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: caster.id,
      a: ability.id,
      v: '5'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);
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
      magicDamage: leftCounter,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    let hasPostEffects = false;
    for (let i = target.effects.length - 1; i >= 0; i--) {
      if (target.effects[i].isRemovable && target.effects[i].isBuff) {
        if (target.effects[i].id === '43-symbiosis' || target.effects[i].id === '41-harmony') {
          hasPostEffects = true;
        }
        caster.effects.push(target.effects[i]);
        this.battleService.applyEffect(battle, heroes, caster, target.effects[i], false, isSimulation);
        target.effects.splice(i, 1);
      }
    }

    if (hasPostEffects) {
      for (let i = 0; i < heroes.length; i++) {
        this.heroService.resetHeroState(heroes[i]);
        this.heroService.calcHero(heroes[i]);
        this.battleService.applyCharEffects(battle, heroes, heroes[i], false, isSimulation);

        for (let j = 0; j < heroes[i].pets.length; j++) {
          this.heroService.resetPetState(heroes[i].pets[j]);
          this.battleService.applyCharEffects(battle, heroes, heroes[i].pets[j], false, isSimulation);
        }
      }
    } else {
      if (target.isPet) {
        this.heroService.resetPetState(target as IPet);
      } else {
        this.heroService.resetHeroState(target as IHero);
        this.heroService.calcHero(target as IHero);
      }
      this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);
    }

    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2,
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: Math.ceil(caster.mana / 2),
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    caster.health += 2;
    if (caster.health > caster.maxHealth) {
      caster.health = caster.maxHealth;
    }

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: caster.id,
      a: ability.id,
      v: '2'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      directDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    caster.health += 2;
    if (caster.health > caster.maxHealth) {
      caster.health = caster.maxHealth;
    }

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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: position.x,
      y: position.y
    };
    battle.mapEffects.push(Object.assign({}, effect));
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const targetPositionX = target.position.x;
    const targetPositionY = target.position.y;

    target.position.x = caster.position.x;
    target.position.y = caster.position.y;

    caster.position.x = targetPositionX;
    caster.position.y = targetPositionY;

    this.heroService.takeMana(caster, 4);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      tr: target.id
    });

    battle.log.push({
      id: caster.id,
      t: LogMessageType.TAKE_MANA,
      v: '4'
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
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  // Avatar
  '11-furious-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 3,
      magicDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '12-flame-dash'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charge(battle, heroes, target.position, caster, isSimulation);

    const casterTeam = this.heroService.getTeamByHeroId(caster.id, battle.teams);
    const targetTeam = this.heroService.getTeamByCharId(target.id, battle.teams);

    if (casterTeam.id === targetTeam.id) {
      this.heroService.takeEnergy(caster, 4);
      battle.log.push({
        t: LogMessageType.ABILITY_CAST,
        c: caster.id,
        a: ability.id,
        tr: target.id
      });
    } else {
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target,
        magicDamage: 3,
        abilityId: ability.id,
        isSimulation
      });
    }

    return battle;
  }

  '13-fireball'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 1,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '22-cauterization'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    target.health += 6;

    if (target.health > target.maxHealth) {
      target.health = target.maxHealth;
    }

    battle.log.push({
      t: LogMessageType.ABILITY_HEAL,
      c: caster.id,
      tr: target.id,
      a: ability.id,
      v: '6'
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '23-scorch'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 3,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-dragon-tail'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 3,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '32-elements-control'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-meteor'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const aoeEnemies = this.battleService.findEnemies(
      battle,
      caster.id,
      1,
      true,
      ability.id,
      false,
      false,
      target.position
    );

    for (let i = 0; i < aoeEnemies.length; i++) {
      if (aoeEnemies[i] !== target.id) {
        const aoeEnemiesChar = this.heroService.getCharById(aoeEnemies[i], heroes);
        this.battleService.charTakesDamage({
          battle,
          caster,
          heroes,
          target: aoeEnemiesChar,
          magicDamage: 1,
          abilityId: ability.id,
          isSimulation
        });
      }
    }

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 4,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '41-harmony'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: caster.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '42-dragon-spirit'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.PET_SUMMON,
      c: caster.id,
      a: 'dragon-spirit'
    });

    const newPet = new Pet('dragon-spirit', position);
    caster.pets.push(newPet);

    this.battleService.afterMoveChar(battle, heroes, newPet, isSimulation);
    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  '42-dragon-spirit-breath'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IPet,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    ability.left = ability.cd;

    let abilityDamage = 5;

    if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
      abilityDamage += 3;
    }

    const aoeEnemies = this.battleService.findEnemies(
      battle,
      caster.id,
      1,
      true,
      ability.id,
      false,
      false,
      target.position
    );

    for (let i = 0; i < aoeEnemies.length; i++) {
      if (aoeEnemies[i] !== target.id) {
        const aoeEnemiesChar = this.heroService.getCharById(aoeEnemies[i], heroes);
        this.battleService.charTakesDamage({
          battle,
          caster,
          heroes,
          target: aoeEnemiesChar,
          magicDamage: abilityDamage,
          abilityId: ability.id,
          isSimulation
        });
      }
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

    return battle;
  }

  '43-fire'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: position.x,
      y: position.y
    };
    battle.mapEffects.push(Object.assign({}, effect));
    return battle;
  }

  // Shadow
  '11-aimed-shot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '12-heavy-shot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    this.battleService.knockBack(battle, heroes, target, caster.position, isSimulation);
    return battle;
  }

  '13-debilitating-shot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '21-rapid-fire'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: caster.id,
      a: ability.id
    });

    caster.primaryWeapon.isUsed = false;
    return battle;
  }

  '22-cat-hook'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    caster.position.x = position.x;
    caster.position.y = position.y;

    this.battleService.afterMoveChar(battle, heroes, caster, isSimulation);
    return battle;
  }

  '23-blind'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-volley'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const enemies = this.battleService.findEnemies(battle, caster.id, 3, true, ability.id, false, false);
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
        physDamage: caster.primaryWeapon.physDamage + 2,
        isSimulation
      });
    }

    return battle;
  }

  '32-shadow-cloak'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: caster.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-dark-shot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 2,
      magicDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    if (!target.isPet) {
      this.heroService.spendMana(target as IHero, 2);
    }

    return battle;
  }

  '41-headshot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      directDamage: caster.primaryWeapon.physDamage + 1 + caster.strength,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '42-phantom'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.PET_SUMMON,
      c: caster.id,
      a: 'phantom'
    });

    const newPet = new Pet('phantom', position);
    caster.pets.push(newPet);

    this.battleService.afterMoveChar(battle, heroes, newPet, isSimulation);
    this.battleService.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  '42-phantom-imitation-shot'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IPet,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    ability.left = ability.cd;

    const shadow = this.heroService.getHeroById('shadow', heroes);

    let abilityDamage = shadow.primaryWeapon.physDamage + shadow.strength;

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

  '43-oblivion'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 5,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  // Lightbringer
  '11-sun-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '12-skies-gift'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    caster.position.x = position.x;
    caster.position.y = position.y;

    this.battleService.afterMoveChar(battle, heroes, caster, isSimulation);

    const allies = this.battleService.findAllies(battle, caster.id, 2, true, true, true, false);
    for (let i = 0; i < allies.length; i++) {
      const allyChar = this.heroService.getCharById(allies[i], heroes);
      if (allyChar.health < allyChar.maxHealth) {
        allyChar.health += 2;

        if (allyChar.health > allyChar.maxHealth) {
          allyChar.health = allyChar.maxHealth;
        }

        battle.log.push({
          t: LogMessageType.ABILITY_HEAL,
          c: caster.id,
          tr: allyChar.id,
          a: ability.id,
          v: '2'
        });
      }
    }

    return battle;
  }

  '13-sun-touch'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const casterTeam = this.heroService.getTeamByHeroId(caster.id, battle.teams);
    const targetTeam = this.heroService.getTeamByCharId(target.id, battle.teams);

    if (casterTeam.id === targetTeam.id) {
      target.health += 2;

      if (target.health > target.maxHealth) {
        target.health = target.maxHealth;
      }

      battle.log.push({
        t: LogMessageType.ABILITY_HEAL,
        c: caster.id,
        tr: target.id,
        a: ability.id,
        v: '2'
      });
    } else {
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target,
        magicDamage: 2,
        abilityId: ability.id,
        isSimulation
      });
    }
    return battle;
  }

  '31-retribution'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const healthDamage = this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 1,
      magicDamage: 1,
      abilityId: ability.id,
      isSimulation
    });

    if (healthDamage > 0 && caster.health < caster.maxHealth && caster.health > 0) {
      caster.health += healthDamage;

      if (caster.health > caster.maxHealth) {
        caster.health = caster.maxHealth;
      }

      battle.log.push({
        t: LogMessageType.ABILITY_HEAL,
        c: caster.id,
        tr: caster.id,
        a: ability.id,
        v: healthDamage + ''
      });
    }

    return battle;
  }

  '32-sun-aegis'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '33-cleansing'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    const casterTeam = this.heroService.getTeamByHeroId(caster.id, battle.teams);
    const targetTeam = this.heroService.getTeamByCharId(target.id, battle.teams);
    let effectsRemoved = 0;

    for (let i = target.effects.length - 1; i > -1; i--) {
      if (target.effects[i].isRemovable) {
        if (casterTeam.id === targetTeam.id) {
          if (!target.effects[i].isBuff) {
            target.effects.splice(i, 1);
            effectsRemoved++;
          }
        } else {
          if (target.effects[i].isBuff) {
            target.effects.splice(i, 1);
            effectsRemoved++;
          }
        }
      }
    }

    if (!target.isPet) {
      this.heroService.resetHeroState(target as IHero);
      this.heroService.calcHero(target as IHero);
    } else {
      this.heroService.resetPetState(target as IPet);
    }
    this.battleService.applyCharEffects(battle, heroes, target, false, isSimulation);

    if (effectsRemoved > 0 && caster.health < caster.maxHealth) {
      caster.health += 3 * effectsRemoved;

      if (caster.health > caster.maxHealth) {
        caster.health = caster.maxHealth;
      }

      battle.log.push({
        t: LogMessageType.ABILITY_HEAL,
        c: caster.id,
        tr: caster.id,
        a: ability.id,
        v: 3 * effectsRemoved + ''
      });
    }

    return battle;
  }

  '41-hammer-of-wrath'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + 2,
      magicDamage: 2,
      abilityId: ability.id,
      isSimulation
    });

    if (!target || target.health < 1) {
      return battle;
    }

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '42-divine-radiance'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '43-sunrise'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const allies = this.battleService.findAllies(battle, caster.id, 3, true, true, true, false);
    for (let i = 0; i < allies.length; i++) {
      const allyChar = this.heroService.getCharById(allies[i], heroes);
      if (allyChar.health < allyChar.maxHealth) {
        allyChar.health += caster.intellect;

        if (allyChar.health > allyChar.maxHealth) {
          allyChar.health = allyChar.maxHealth;
        }

        battle.log.push({
          t: LogMessageType.ABILITY_HEAL,
          c: caster.id,
          tr: allyChar.id,
          a: ability.id,
          v: caster.intellect + ''
        });
      }
    }

    return battle;
  }

  // Avenger
  '11-double-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.secondaryWeapon.physDamage,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '12-desert-revenge'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: caster.primaryWeapon.physDamage + caster.secondaryWeapon.physDamage,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '13-fit-of-energy'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.heroService.takeEnergy(caster, 4);
    this.heroService.takeMana(caster, 3);

    return battle;
  }

  '21-precise-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.secondaryWeapon.physDamage + 1,
      abilityId: ability.id,
      isSimulation
    });

    return battle;
  }

  '22-quicksands'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '23-temporal-strike'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      physDamage: caster.primaryWeapon.physDamage + caster.secondaryWeapon.physDamage,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '31-blade-storm'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    const enemies = this.battleService.findEnemies(battle, caster.id, 1, true, ability.id, false, false);
    if (enemies.length > 1) {
      ability.left = 0;
    }
    for (let i = 0; i < enemies.length; i++) {
      if (caster.isDead) {
        return battle;
      }
      const enemyChar = this.heroService.getCharById(enemies[i], heroes);
      this.battleService.charTakesDamage({
        battle,
        caster,
        heroes,
        target: enemyChar,
        abilityId: ability.id,
        physDamage: caster.primaryWeapon.physDamage + caster.secondaryWeapon.physDamage + 2,
        isSimulation
      });
    }

    return battle;
  }

  '32-sand-storm'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      x: position.x,
      y: position.y
    });

    const effect: IEffect = this.addEffect(battle, heroes, caster, ability.id, caster.id, isSimulation);
    effect.position = {
      x: position.x,
      y: position.y
    };
    battle.mapEffects.push(Object.assign({}, effect));
    return battle;
  }

  '33-time-trap'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    this.battleService.charTakesDamage({
      battle,
      caster,
      heroes,
      target,
      magicDamage: 4,
      abilityId: ability.id,
      isSimulation
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '41-excellence'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: target.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '42-sand-form'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      tr: caster.id,
      a: ability.id
    });

    this.addEffect(battle, heroes, target, ability.id, caster.id, isSimulation);
    return battle;
  }

  '43-sands-of-time'(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IHero,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    this.spendResouces(battle, heroes, ability, caster, target, position, isSimulation);

    battle.log.push({
      t: LogMessageType.ABILITY_CAST,
      c: caster.id,
      a: ability.id,
      tr: target.id
    });

    caster.energy = caster.maxEnergy;
    caster.mana = caster.maxMana;
    caster.primaryWeapon.isUsed = false;
    caster.secondaryWeapon.isUsed = false;
    return battle;
  }
}
