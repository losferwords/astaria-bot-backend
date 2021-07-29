import { Injectable } from '@nestjs/common';
import { v1 as uuid } from 'uuid';
import * as _ from 'lodash';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IHero } from 'src/interfaces/IHero';
import { ITeam } from 'src/interfaces/ITeam';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';
import { Team } from 'src/models/Team';
import { Const } from 'src/static/const';
import { IScenarioSetupDto } from 'src/dto/scenario-setup.dto';
import { IBattleSetupDto } from 'src/dto/battle-setup.dto';
import { MapService } from './map.service';
import { HeroService } from './hero.service';
import { ReportService } from './report.service';
import { IPosition } from 'src/interfaces/IPosition';
import { IAction } from 'src/interfaces/IAction';
import { ActionType } from 'src/enums/action-type.enum';
import { EffectService } from './effect.service';
import { IEffect } from 'src/interfaces/IEffect';
import { IAbility } from 'src/interfaces/IAbility';
import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IEquip } from 'src/interfaces/IEquip';
import { ICharTakesDamageArgs } from 'src/interfaces/backend-side-only/ICharTakesDamageArgs';
import { ILogMessage } from 'src/interfaces/ILogMessage';

@Injectable()
export class BattleService {
  battles: IBattle[] = [];

  constructor(
    private mapService: MapService,
    private heroService: HeroService,
    private effectService: EffectService,
    private reportService: ReportService
  ) {}

  private getQueue(teams: ITeam[]): string[] {
    const heroes = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].heroes.length; j++) {
        heroes.push(teams[i].heroes[j].id);
      }
    }
    return _.intersection(Const.moveOrder, heroes);
  }

  getBattleById(id: string): IBattle {
    return this.battles.find((battle: IBattle) => {
      return battle.id === id;
    });
  }

  getPossibleEnemies(battle: IBattle, sourceHeroId: string): IChar[] {
    const possibleEnemies: IChar[] = [];
    let enemyHeroes: IHero[] = [];
    enemyHeroes = battle.teams.find((team: ITeam) => {
      return !team.heroes.find((hero: IHero) => {
        return hero.id === sourceHeroId;
      });
    }).heroes;

    for (let i = 0; i < enemyHeroes.length; i++) {
      possibleEnemies.push(enemyHeroes[i]);
      possibleEnemies.push(...enemyHeroes[i].pets);
    }
    return possibleEnemies;
  }

  getPossibleAllies(battle: IBattle, sourceHeroId: string, includeSelf: boolean): IChar[] {
    const possibleAllies: IChar[] = [];
    let allyHeroes: IHero[] = [];
    allyHeroes = battle.teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === sourceHeroId;
      });
    }).heroes;

    for (let i = 0; i < allyHeroes.length; i++) {
      if (allyHeroes[i].id === sourceHeroId) {
        if (includeSelf) {
          possibleAllies.push(allyHeroes[i]);
        }
      } else {
        possibleAllies.push(allyHeroes[i]);
      }
      possibleAllies.push(...allyHeroes[i].pets);
    }
    return possibleAllies;
  }

  getHeroesInBattle(battle: IBattle): IHero[] {
    const heroes = new Array(battle.scenario.teamSize[0] * battle.scenario.teamSize[1]);
    for (let i = 0; i < heroes.length; i++) {
      heroes[i] = battle.teams[Math.floor(i / battle.scenario.teamSize[0])].heroes[i % battle.scenario.teamSize[1]];
    }
    return heroes;
  }

  getScenarios(): IScenarioSetupDto[] {
    const scenarios = Const.scenarios.map((sc) => {
      return {
        id: sc.id,
        teamSize: sc.teamSize
      };
    });
    return scenarios;
  }

  startBattle(battleSetup: IBattleSetupDto): IBattle {
    let battle: IBattle;
    this.heroService.setRandomHeroes(battleSetup.teamSetup);
    switch (battleSetup.scenarioId) {
      case '0':
        battle = {
          id: uuid(),
          scenario: new ChthonRuins(),
          teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
          crystalPositions: [],
          queue: [],
          log: []
        };

        battle.scenario.setHeroPositions(battle.teams);
        battle.queue = this.getQueue(battle.teams);
        const heroes = this.getHeroesInBattle(battle);
        const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
        battle.log.push({
          type: LogMessageType.TURN_START,
          id: activeHero.id,
          position: activeHero.position
        });
        for (let i = 0; i < heroes.length; i++) {
          this.beforeTurn(battle, heroes, heroes[i], false);
        }
        battle.scenario.beforeTurn(battle);
        break;
    }
    this.battles.push(battle);
    return battle;
  }

  getMovePoints(battle: IBattle, petId?: string): IPosition[] {
    const heroes = this.getHeroesInBattle(battle);
    let char: IChar;
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    if (petId) {
      char = activeHero.pets.find((p) => p.id === petId);
    } else {
      char = this.heroService.getHeroById(battle.queue[0], heroes);
    }

    let movePoints: IPosition[] = [];
    if (this.heroService.canMove(char, !!petId)) {
      movePoints = this.mapService.getMovePoints(char.position, 1, battle.scenario.tiles, heroes);
    }
    return movePoints;
  }

  moveChar(battle: IBattle, targetPosition: IPosition, petId?: string): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    let activeChar: IChar = activeHero;
    if (petId) {
      activeChar = activeHero.pets.find((p) => p.id === petId);
    }
    if (this.heroService.canMove(activeChar, !!petId)) {
      this.heroService.moveChar(battle, activeChar, targetPosition, !!petId);
      battle.log.push({
        type: LogMessageType.MOVE,
        position: {
          x: targetPosition.x,
          y: targetPosition.y
        },
        id: activeChar.id
      });

      const crystalPositionIndex = battle.crystalPositions.findIndex((cp: IPosition) => {
        return cp.x === targetPosition.x && cp.y === targetPosition.y;
      });
      if (crystalPositionIndex > -1) {
        const activeTeam = this.heroService.getTeamByHeroId(activeHero.id, battle.teams);
        activeTeam.crystals += 1;
        battle.log.push({
          type: LogMessageType.TAKE_CRYSTAL,
          id: activeChar.id
        });
        battle.crystalPositions.splice(crystalPositionIndex, 1);
      }
    }
    return battle;
  }

  knockBack(battle: IBattle, target: IChar, charPosition: IPosition) {
    const heroes = this.getHeroesInBattle(battle);
    this.mapService.knockBack(target, charPosition, battle.scenario.tiles, heroes);
  }

  charge(battle: IBattle, targetPosition: IPosition, char: IChar) {
    const heroes = this.getHeroesInBattle(battle);
    this.mapService.charge(targetPosition, char, battle.scenario.tiles, heroes);
  }

  applyEffect(
    battle: IBattle,
    heroes: IHero[],
    char: IChar,
    effect: IEffect,
    isBeforeTurn: boolean,
    isSimulation: boolean
  ) {
    switch (effect.id) {
      case '12-poison-touch':
        if (isBeforeTurn) {
          this.charTakesDamage({
            battle,
            caster: this.heroService.getHeroById(effect.casterId, heroes),
            heroes,
            target: char,
            directDamage: 1,
            effectId: effect.id,
            isSimulation
          });
        }
        break;
      case '23-defender':
        //No need to apply, just effect existance
        break;
      default:
        this.effectService.apply(effect, char, isBeforeTurn);
        break;
    }
  }

  applyHeroEffects(battle: IBattle, heroes: IHero[], hero: IHero, isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < hero.effects.length; i++) {
      if (hero.effects[i].left > 0) {
        this.applyEffect(battle, heroes, hero, hero.effects[i], isBeforeTurn, isSimulation);
      }
    }
    for (let i = 0; i < hero.pets.length; i++) {
      for (let j = 0; j < hero.pets[i].effects.length; j++) {
        if (hero.pets[i].effects[j].left > 0) {
          this.applyEffect(battle, heroes, hero.pets[i], hero.pets[i].effects[j], isBeforeTurn, isSimulation);
        }
      }
    }
  }

  beforeTurn(battle: IBattle, heroes: IHero[], hero: IHero, isSimulation: boolean) {
    if (hero.isDead) {
      return;
    }

    hero = this.heroService.resetHeroState(hero);
    hero = this.heroService.calcHero(hero);
    this.applyHeroEffects(battle, heroes, hero, true, isSimulation);

    if (hero.isDead) {
      return; // check again because after DOT hero can die
    }

    hero.energy = hero.maxEnergy;
    if (hero.health + hero.regeneration < hero.maxHealth) {
      hero.health += hero.regeneration;
    } else {
      hero.health = hero.maxHealth;
    }

    if (hero.mana + hero.mind < hero.maxMana) {
      hero.mana += hero.mind;
    } else {
      hero.mana = hero.maxMana;
    }

    for (let i = 0; i < hero.abilities.length; i++) {
      if (hero.abilities[i].left > 0) {
        hero.abilities[i].left--;
      }
    }

    for (let i = hero.effects.length - 1; i > -1; i--) {
      if (hero.effects[i].left > 0) {
        hero.effects[i].left--;
      } else {
        hero.effects.splice(i, 1);
      }
    }

    hero.primaryWeapon.isUsed = false;
    if (hero.secondaryWeapon && !hero.secondaryWeapon.isPassive) {
      hero.secondaryWeapon.isUsed = false;
    }

    for (let i = 0; i < hero.pets.length; i++) {
      if (hero.pets[i].health + hero.pets[i].regeneration < hero.pets[i].maxHealth) {
        hero.pets[i].health += hero.pets[i].regeneration;
      } else {
        hero.pets[i].health = hero.pets[i].maxHealth;
      }

      if (hero.pets[i].ability.left > 0) {
        hero.pets[i].ability.left--;
      }

      for (let j = hero.pets[i].effects.length - 1; j > -1; j--) {
        if (hero.pets[i].effects[j].left > 0) {
          hero.pets[i].effects[j].left--;
        } else {
          hero.pets[i].effects.splice(j, 1);
        }
      }
    }
  }

  endTurn(battle: IBattle, isSimulation: boolean): IBattle {
    battle.log.push({
      type: LogMessageType.TURN_END,
      id: battle.queue[0]
    });
    battle.queue.push(battle.queue.shift());
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    battle.log.push({
      type: LogMessageType.TURN_START,
      id: activeHero.id,
      position: activeHero.position //initial position at the new turn beginning (for previousMoves)
    });

    this.beforeTurn(battle, heroes, activeHero, isSimulation);

    battle.scenario.beforeTurn(battle);
    return battle;
  }

  findEnemies(battle: IBattle, sourceHeroId: string, radius: number, petId?: string): string[] {
    const heroes = this.getHeroesInBattle(battle);
    let sourceChar: IChar = this.heroService.getHeroById(sourceHeroId, heroes);
    if (petId) {
      sourceChar = (sourceChar as IHero).pets.find((pet) => pet.id === petId);
    }
    const points = this.mapService.findNearestPoints(sourceChar.position, battle.scenario.tiles, radius);
    const possibleEnemies = this.getPossibleEnemies(battle, sourceHeroId);

    const enemies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleEnemies.length; j++) {
        if (
          points[i].x === possibleEnemies[j].position.x &&
          points[i].y === possibleEnemies[j].position.y &&
          !(possibleEnemies[j] as IHero).isDead &&
          !this.mapService.rayTrace(
            { x: sourceChar.position.x, y: sourceChar.position.y },
            { x: points[i].x, y: points[i].y },
            battle.scenario.tiles,
            heroes
          )
        ) {
          enemies.push(possibleEnemies[j].id);
        }
      }
    }
    return enemies;
  }

  findAllies(battle: IBattle, sourceHeroId: string, radius: number, includeSelf: boolean): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceHero = this.heroService.getHeroById(sourceHeroId, heroes);
    const points = this.mapService.findNearestPoints(sourceHero.position, battle.scenario.tiles, radius);
    const possibleAllies = this.getPossibleAllies(battle, sourceHeroId, includeSelf);

    const allies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleAllies.length; j++) {
        if (
          points[i].x === possibleAllies[j].position.x &&
          points[i].y === possibleAllies[j].position.y &&
          !(possibleAllies[j] as IHero).isDead &&
          !this.mapService.rayTrace(
            { x: sourceHero.position.x, y: sourceHero.position.y },
            { x: points[i].x, y: points[i].y },
            battle.scenario.tiles,
            heroes
          )
        ) {
          allies.push(possibleAllies[j].id);
        }
      }
    }
    return allies;
  }

  findHeroes(battle: IBattle, sourceHeroId: string, radius: number): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceHero = this.heroService.getHeroById(sourceHeroId, heroes);
    const points = this.mapService.findNearestPoints(sourceHero.position, battle.scenario.tiles, radius);
    const possibleChars: IChar[] = [];

    for (let i = 0; i < heroes.length; i++) {
      possibleChars.push(heroes[i]);
      possibleChars.push(...heroes[i].pets);
    }

    const chars: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleChars.length; j++) {
        if (
          points[i].x === possibleChars[j].position.x &&
          points[i].y === possibleChars[j].position.y &&
          !(possibleChars[j] as IHero).isDead &&
          !this.mapService.rayTrace(
            { x: sourceHero.position.x, y: sourceHero.position.y },
            { x: points[i].x, y: points[i].y },
            battle.scenario.tiles,
            heroes
          )
        ) {
          chars.push(possibleChars[j].id);
        }
      }
    }
    return chars;
  }

  useWeapon(battle: IBattle, targetId: string, weaponId: string, isSimulation: boolean): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const target = this.heroService.getCharById(targetId, heroes);
    let weapon: IEquip;

    if (activeHero.primaryWeapon.id === weaponId) {
      weapon = activeHero.primaryWeapon;
    } else if (activeHero.secondaryWeapon.id === weaponId) {
      weapon = activeHero.secondaryWeapon;
    } else {
      return battle;
    }

    if (!this.heroService.canUseWeapon(activeHero, weapon)) {
      return battle;
    }

    const { physDamage, magicDamage } = this.calculateWeaponDamage(weapon, activeHero);

    activeHero.energy -= weapon.energyCost;
    weapon.isUsed = true;

    const healthDamage = this.charTakesDamage({
      battle,
      caster: activeHero,
      heroes,
      target,
      physDamage,
      magicDamage,
      weaponId,
      isSimulation
    });

    this.checkPassiveAbilityTrigger('22-counterattack', battle, activeHero, heroes, target, healthDamage, isSimulation);
    return battle;
  }

  afterCastAbility(
    newBattle: IBattle,
    activeChar: IChar,
    heroes: IHero[],
    ability: IAbility,
    target: IChar,
    position: IPosition,
    isSimulation: boolean
  ): IBattle {
    if (!ability.isPassive) {
      this.checkPassiveAbilityTrigger('22-counterattack', newBattle, activeChar, heroes, target, 0, isSimulation);
    }
    return newBattle;
  }

  battleEnd(battle: IBattle, winner: ITeam) {
    let winnerHeroes = '';
    for (let i = 0; i < winner.heroes.length; i++) {
      winnerHeroes += winner.heroes[i].id + ' ';
    }
    battle.log.push({
      type: LogMessageType.WIN,
      id: winnerHeroes
    });
  }

  removeBattle(battleId: string) {
    const battleIndex = this.battles.findIndex((b: IBattle) => {
      return b.id === battleId;
    });

    this.battles.splice(battleIndex, 1);
  }

  upgradeEquip(battle: IBattle, equipId: string): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    return this.heroService.upgradeEquip(battle, heroes, equipId);
  }

  learnAbility(battle: IBattle, abilityId: string): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    return this.heroService.learnAbility(battle, heroes, abilityId);
  }

  checkAbilityForUse(ability: IAbility, char: IChar): boolean {
    if (char.isStunned) {
      return false;
    }

    if (ability.isPassive) {
      return false;
    }

    if (ability.needWeapon && char.isDisarmed) {
      return false;
    }

    if (ability.isSpell && char.isSilenced) {
      return false;
    }

    if (ability.targetType === AbilityTargetType.MOVE && char.isImmobilized) {
      return false;
    }

    if (char.isPet) {
      return ability.left === 0;
    } else {
      const hero: IHero = char as IHero;

      if (ability.left === 0 && hero.energy - ability.energyCost >= 0 && hero.mana - ability.manaCost >= 0) {
        switch (ability.id) {
          case '13-dangerous-knowledge':
            return hero.intellect > 0;
          case '22-wolf':
            return hero.pets.findIndex((p) => p.id === 'wolf') < 0;
          default:
            return true;
        }
      }
    }
    return false;
  }

  charTakesDamage({
    battle,
    caster,
    heroes,
    target,
    physDamage,
    magicDamage,
    directDamage,
    weaponId,
    abilityId,
    effectId,
    isSimulation
  }: ICharTakesDamageArgs): number {
    let healthDamage = 0;

    if (this.heroService.getCharEffectById(target, '23-defender')) {
      target = this.heroService.getHeroById('paragon', heroes);
    }

    if (target.isPet) {
      healthDamage = (physDamage || 0) + (magicDamage || 0) + (directDamage || 0);
    } else {
      if ((target as IHero).isDead) {
        return 0;
      }
      if (physDamage > 0) {
        healthDamage += physDamage - (target as IHero).armor;
      }
      if (magicDamage > 0) {
        healthDamage += magicDamage - (target as IHero).will;
      }
      if (directDamage > 0) {
        healthDamage += directDamage;
      }
    }

    if (healthDamage < 0) {
      healthDamage = 0;
    }

    const battleLogMessage: ILogMessage = {
      casterId: caster.id,
      targetId: target.id,
      value: healthDamage + '',
      type: weaponId
        ? LogMessageType.WEAPON_DAMAGE
        : abilityId
        ? LogMessageType.ABILITY_DAMAGE
        : LogMessageType.EFFECT_DAMAGE
    };

    if (weaponId) {
      battleLogMessage.equipId = weaponId;
    } else if (abilityId || effectId) {
      battleLogMessage.abilityId = abilityId || effectId;
    }

    battle.log.push(battleLogMessage);

    if (healthDamage === 0) {
      return 0;
    }
    target.health -= healthDamage;

    this.afterDamageTaken(battle, caster, heroes, target, healthDamage, isSimulation);

    if (target.health <= 0) {
      if (target.isPet) {
        for (let i = 0; i < heroes.length; i++) {
          for (let j = heroes[i].pets.length - 1; j >= 0; j--) {
            if (heroes[i].pets[j].id === target.id) {
              battle.log.push({
                type: LogMessageType.DEATH,
                id: heroes[i].pets[j].id
              });
              heroes[i].pets[j] = undefined;
              target = undefined;
              heroes[i].pets.splice(j, 1);
            }
          }
        }
      } else {
        this.heroDeath(battle, target as IHero, isSimulation);
      }
    }

    return healthDamage;
  }

  heroDeath(battle: IBattle, hero: IHero, isSimulation: boolean) {
    if (hero.isDead) {
      return;
    }
    hero.health = 0;
    hero.energy = 0;
    hero.mana = 0;
    hero.effects = [];
    hero.isDead = true;

    battle.log.push({
      type: LogMessageType.DEATH,
      id: hero.id
    });

    const queueIndex = battle.queue.findIndex((heroId: string) => {
      return hero.id === heroId;
    });

    if (queueIndex === 0) {
      if (battle.queue.length > 1) {
        this.endTurn(battle, isSimulation);
      }
      battle.queue.splice(battle.queue.length - 1, 1);
    } else {
      battle.queue.splice(queueIndex, 1);
    }
  }

  afterDamageTaken(
    battle: IBattle,
    caster: IChar,
    heroes: IHero[],
    target: IChar,
    value: number,
    isSimulation: boolean
  ) {
    this.checkPassiveAbilityTrigger('12-reflection', battle, caster, heroes, target, value, isSimulation);

    const winner = battle.scenario.checkForWin(battle.teams);
    if (winner) {
      this.battleEnd(battle, winner);
      if (!isSimulation) {
        this.removeBattle(battle.id);
        this.reportService.saveBattleResults(battle);
        this.reportService.addToStatistics(battle, winner);
      }
    }
  }

  calculateWeaponDamage(weapon: IEquip, activeHero: IHero): { physDamage: number; magicDamage: number } {
    let physDamage = weapon.physDamage || 0;
    let magicDamage = weapon.magicDamage || 0;

    if (physDamage > 0) {
      physDamage = weapon.physDamage + activeHero.strength;
    }

    if (activeHero.id === 'highlander' && this.heroService.getHeroAbilityById(activeHero, '13-lightning-rod')) {
      magicDamage = magicDamage + 2;
    }

    if (magicDamage > 0) {
      magicDamage = magicDamage + activeHero.intellect;
    }

    return { physDamage, magicDamage };
  }

  checkPassiveAbilityTrigger(
    passiveAbility: string,
    battle: IBattle,
    activeChar: IChar,
    heroes: IHero[],
    target: IChar,
    damageValue: number,
    isSimulation: boolean
  ) {
    switch (passiveAbility) {
      case '22-counterattack':
        if (activeChar && activeChar.id !== 'paragon' && activeChar.health > 0) {
          let activeHero: IHero = activeChar as IHero;
          if (activeChar.isPet) {
            activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
          }
          const enemies = this.findEnemies(battle, activeHero.id, 2, activeChar.isPet ? activeChar.id : undefined);
          for (let i = 0; i < enemies.length; i++) {
            if (enemies[i] === 'paragon') {
              const paragon = this.heroService.getHeroById(enemies[i], heroes);
              if (!paragon.isDisarmed && this.heroService.getHeroAbilityById(paragon, passiveAbility)) {
                let counterDamage = paragon.primaryWeapon.physDamage + paragon.strength + 1;
                this.charTakesDamage({
                  battle,
                  caster: paragon,
                  heroes,
                  target: activeChar,
                  abilityId: passiveAbility,
                  physDamage: counterDamage,
                  isSimulation
                });
              }
              break;
            }
          }
        }
        break;
      case '12-reflection':
        if (target.id === 'oracle' && this.heroService.getHeroAbilityById(target as IHero, '12-reflection')) {
          this.heroService.takeMana(target as IHero, damageValue);
          battle.log.push({
            id: target.id,
            type: LogMessageType.TAKE_MANA,
            value: damageValue + ''
          });
          const enemies = this.findEnemies(battle, target.id, 1);
          for (let i = 0; i < enemies.length; i++) {
            const enemyChar = this.heroService.getCharById(enemies[i], heroes);
            const magicDamage = damageValue + (target as IHero).intellect;
            this.charTakesDamage({
              battle,
              caster: target,
              heroes,
              target: enemyChar,
              abilityId: passiveAbility,
              magicDamage,
              isSimulation
            });
          }
        }
        break;
    }
  }

  getAvailableActions(battle: IBattle, previousMoves: IPosition[]): IAction[] {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const team = this.heroService.getTeamByHeroId(activeHero.id, battle.teams);
    const actions: IAction[] = [];

    if (activeHero.abilities.length === 0) {
      const heroData = this.heroService.getHeroData(activeHero.id);
      for (let i = 0; i < 3; i++) {
        actions.push({
          type: ActionType.LEARN_ABILITY,
          abilityId: heroData.abilities[i].id
        });
      }
      return actions;
    }

    if (team.crystals > 0 || activeHero.crystals > 0) {
      const heroData = this.heroService.getHeroData(activeHero.id);

      const heroAbilityLevel = activeHero.abilities.length;
      for (let i = 3 * heroAbilityLevel; i < 3 * heroAbilityLevel + 3; i++) {
        if (heroData.abilities[i]) {
          actions.push({
            type: ActionType.LEARN_ABILITY,
            abilityId: heroData.abilities[i].id
          });
        }
      }

      if (
        activeHero.primaryWeapon.level < 3 &&
        (team.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost ||
          activeHero.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost)
      ) {
        actions.push({
          type: ActionType.UPGRADE_EQUIP,
          equipId: activeHero.primaryWeapon.id
        });
      }
      if (
        activeHero.secondaryWeapon &&
        activeHero.secondaryWeapon.level < 3 &&
        (team.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost ||
          activeHero.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost)
      ) {
        actions.push({
          type: ActionType.UPGRADE_EQUIP,
          equipId: activeHero.secondaryWeapon.id
        });
      }
      if (
        activeHero.chestpiece.level < 3 &&
        (team.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost ||
          activeHero.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost)
      ) {
        actions.push({
          type: ActionType.UPGRADE_EQUIP,
          equipId: activeHero.chestpiece.id
        });
      }
    }

    for (let i = 0; i < activeHero.abilities.length; i++) {
      if (this.checkAbilityForUse(activeHero.abilities[i], activeHero)) {
        const ability = activeHero.abilities[i];
        switch (ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(battle, activeHero.id, ability.range);
            for (let j = 0; j < enemies.length; j++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: enemies[j]
              });
            }
            break;
          case AbilityTargetType.ALLY:
            const allies = this.findAllies(battle, activeHero.id, ability.range, true);
            for (let j = 0; j < allies.length; j++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: allies[j]
              });
            }
            break;
          case AbilityTargetType.ALLY_NOT_ME:
            const alliesWithoutMe = this.findAllies(battle, activeHero.id, ability.range, false);
            for (let j = 0; j < alliesWithoutMe.length; j++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: alliesWithoutMe[j]
              });
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY:
            const allHeroes = this.findHeroes(battle, activeHero.id, ability.range);
            for (let j = 0; j < allHeroes.length; j++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: allHeroes[j]
              });
            }
            break;
          case AbilityTargetType.SELF:
            actions.push({
              type: ActionType.ABILITY,
              abilityId: ability.id,
              casterId: activeHero.id,
              targetId: activeHero.id
            });
            break;
          case AbilityTargetType.MOVE:
            const movePoints = this.mapService.getMovePoints(
              activeHero.position,
              ability.range,
              battle.scenario.tiles,
              heroes
            );
            for (let j = 0; j < movePoints.length; j++) {
              if (
                previousMoves.length &&
                previousMoves.find((move) => move.x === movePoints[j].x && move.y === movePoints[j].y)
              ) {
                continue;
              }
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                position: movePoints[j]
              });
            }
            break;
          case AbilityTargetType.MAP:
            const mapPoints = this.mapService.getMovePoints(
              activeHero.position,
              ability.range,
              battle.scenario.tiles,
              heroes
            );
            for (let j = 0; j < mapPoints.length; j++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                position: mapPoints[j]
              });
            }
            break;
        }
      }
    }

    for (let i = 0; i < activeHero.pets.length; i++) {
      if (this.checkAbilityForUse(activeHero.pets[i].ability, activeHero.pets[i])) {
        switch (activeHero.pets[i].ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(
              battle,
              activeHero.id,
              activeHero.pets[i].ability.range,
              activeHero.pets[i].id
            );
            for (let j = 0; j < enemies.length; j++) {
              actions.push({
                type: ActionType.PET_ABILITY,
                abilityId: activeHero.pets[i].ability.id,
                casterId: activeHero.pets[i].id,
                targetId: enemies[j]
              });
            }
            break;
        }
      }
      if (!activeHero.pets[i].isMoved) {
        const petMovePoints = this.mapService.getMovePoints(
          activeHero.pets[i].position,
          1,
          battle.scenario.tiles,
          heroes
        );
        for (let j = 0; j < petMovePoints.length; j++) {
          actions.push({
            type: ActionType.PET_MOVE,
            casterId: activeHero.pets[i].id,
            position: petMovePoints[j]
          });
        }
      }
    }

    if (this.heroService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        const target = this.heroService.getCharById(enemies[i], heroes);
        const { physDamage, magicDamage } = this.calculateWeaponDamage(activeHero.primaryWeapon, activeHero);
        if (target.isPet || physDamage - (target as IHero).armor > 0 || magicDamage - (target as IHero).will > 0) {
          actions.push({
            type: ActionType.WEAPON_DAMAGE,
            equipId: activeHero.primaryWeapon.id,
            casterId: activeHero.id,
            targetId: enemies[i]
          });
        }
      }
    }
    if (activeHero.secondaryWeapon && this.heroService.canUseWeapon(activeHero, activeHero.secondaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.secondaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        const target = this.heroService.getCharById(enemies[i], heroes);
        const { physDamage, magicDamage } = this.calculateWeaponDamage(activeHero.secondaryWeapon, activeHero);
        if (target.isPet || physDamage - (target as IHero).armor > 0 || magicDamage - (target as IHero).will > 0) {
          actions.push({
            type: ActionType.WEAPON_DAMAGE,
            equipId: activeHero.secondaryWeapon.id,
            casterId: activeHero.id,
            targetId: enemies[i]
          });
        }
      }
    }

    const moves = _.shuffle(this.getMovePoints(battle));
    for (let i = 0; i < moves.length; i++) {
      if (previousMoves.length && previousMoves.find((move) => move.x === moves[i].x && move.y === moves[i].y)) {
        continue;
      }
      actions.push({
        type: ActionType.MOVE,
        position: moves[i]
      });
    }
    actions.push({ type: ActionType.TURN_END });
    return actions;
  }
}
