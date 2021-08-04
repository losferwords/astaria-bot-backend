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
import { IPet } from 'src/interfaces/IPet';

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

  getPossibleEnemies(battle: IBattle, sourceCharId: string): IChar[] {
    const possibleEnemies: IChar[] = [];
    let enemyHeroes: IHero[] = [];
    enemyHeroes = battle.teams.find((team: ITeam) => {
      return !team.heroes.find((hero: IHero) => {
        return hero.id === sourceCharId || hero.pets.find((p) => p.id === sourceCharId);
      });
    }).heroes;

    for (let i = 0; i < enemyHeroes.length; i++) {
      possibleEnemies.push(enemyHeroes[i]);
      possibleEnemies.push(...enemyHeroes[i].pets);
    }
    return possibleEnemies;
  }

  getPossibleAllies(battle: IBattle, sourceCharId: string, includeSelf: boolean): IChar[] {
    const possibleAllies: IChar[] = [];
    let allyHeroes: IHero[] = [];
    allyHeroes = battle.teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === sourceCharId || hero.pets.find((p) => p.id === sourceCharId);
      });
    }).heroes;

    for (let i = 0; i < allyHeroes.length; i++) {
      if (allyHeroes[i].id === sourceCharId) {
        if (includeSelf) {
          possibleAllies.push(allyHeroes[i]);
        }
      } else {
        possibleAllies.push(allyHeroes[i]);
      }
      for (let j = 0; j < allyHeroes[i].pets.length; j++) {
        if (allyHeroes[i].pets[j].id === sourceCharId) {
          if (includeSelf) {
            possibleAllies.push(allyHeroes[i].pets[j]);
          }
        } else {
          possibleAllies.push(allyHeroes[i].pets[j]);
        }
      }
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
          mapEffects: [],
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
          positionX: activeHero.position.x,
          positionY: activeHero.position.y
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

  moveChar(battle: IBattle, targetPosition: IPosition, isSimulation: boolean, petId?: string): IBattle {
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
        positionX: targetPosition.x,
        positionY: targetPosition.y,
        id: activeChar.id
      });

      this.afterMoveChar(battle, heroes, activeHero, isSimulation);
    }
    return battle;
  }

  afterMoveChar(battle: IBattle, heroes: IHero[], movedChar: IChar, isSimulation: boolean) {
    this.applyMapEffects(battle, heroes, false, isSimulation);

    const crystalPositionIndex = battle.crystalPositions.findIndex((cp: IPosition) => {
      return cp.x === movedChar.position.x && cp.y === movedChar.position.y;
    });
    if (crystalPositionIndex > -1) {
      const movedCharTeam = this.heroService.getTeamByCharId(movedChar.id, battle.teams);
      movedCharTeam.crystals += 1;
      battle.log.push({
        type: LogMessageType.TAKE_CRYSTAL,
        id: movedChar.id
      });
      battle.crystalPositions.splice(crystalPositionIndex, 1);
    }
  }

  knockBack(battle: IBattle, heroes: IHero[], target: IChar, charPosition: IPosition, isSimulation: boolean) {
    this.mapService.knockBack(target, charPosition, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, target, isSimulation);
  }

  charge(battle: IBattle, heroes: IHero[], targetPosition: IPosition, char: IChar, isSimulation: boolean) {
    this.mapService.charge(targetPosition, char, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, char, isSimulation);
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
      case '23-defender':
      case '41-void-vortex':
      case '43-symbiosis':
        //No need to apply, just effect existance
        break;
      case '41-piercing-strike':
        if (isBeforeTurn) {
          this.charTakesDamage({
            battle,
            caster: this.heroService.getHeroById(effect.casterId, heroes),
            heroes,
            target: char,
            directDamage: 2,
            effectId: effect.id,
            isSimulation
          });
        }
        break;
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
      case '31-choking-vine':
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
        this.effectService.apply(battle, heroes, effect, char, isBeforeTurn);
        break;
      default:
        this.effectService.apply(battle, heroes, effect, char, isBeforeTurn);
        break;
    }
  }

  applyCharEffects(battle: IBattle, heroes: IHero[], char: IChar, isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < char.effects.length; i++) {
      if (char.effects[i].left > 0) {
        this.applyEffect(battle, heroes, char, char.effects[i], isBeforeTurn, isSimulation);
      }
    }
    if (!char.isPet) {
      for (let i = (char as IHero).pets.length - 1; i >= 0; i--) {
        for (let j = (char as IHero).pets[i].effects.length - 1; j >= 0; j--) {
          if ((char as IHero).pets[i].effects[j].left > 0) {
            this.applyEffect(
              battle,
              heroes,
              (char as IHero).pets[i],
              (char as IHero).pets[i].effects[j],
              isBeforeTurn,
              isSimulation
            );
            if (!(char as IHero).pets[i] || (char as IHero).pets[i].health < 1) {
              break;
            }
          }
        }
      }
    }
  }

  applyPostEffects(battle: IBattle, heroes: IHero[], isBeforeTurn: boolean, isSimulation: boolean) {
    // For symbiosis we need to track heroes parameters to apply
    let heroWithSymbiosis: IHero;
    let symbiosisEffect: IEffect;
    for (let i = 0; i < heroes.length; i++) {
      symbiosisEffect = this.heroService.getCharEffectById(heroes[i], '43-symbiosis');
      if (symbiosisEffect) {
        heroWithSymbiosis = heroes[i];
        break;
      }
    }

    if (heroWithSymbiosis) {
      this.effectService.apply(battle, heroes, symbiosisEffect, heroWithSymbiosis, isBeforeTurn);
    }
  }

  applyMapEffects(battle: IBattle, heroes: IHero[], isBeforeTurn: boolean, isSimulation: boolean) {
    if (battle.mapEffects.length > 0) {
      const mapEffectsToApply: { effect: IEffect; target: IChar }[] = [];
      for (let i = 0; i < battle.mapEffects.length; i++) {
        const effect = battle.mapEffects[i];
        switch (effect.id) {
          // Buff Auras
          case '43-rallying':
            const auraHero = this.heroService.getHeroById(effect.casterId, heroes);
            effect.position = {
              x: auraHero.position.x,
              y: auraHero.position.y
            };
            const alliesInRange = this.findAllies(battle, effect.casterId, effect.range, false);

            const possibleChars: IChar[] = [];

            for (let j = 0; j < heroes.length; j++) {
              possibleChars.push(heroes[j]);
              possibleChars.push(...heroes[j].pets);
            }

            for (let j = 0; j < possibleChars.length; j++) {
              if (!possibleChars[j].isPet) {
                possibleChars[j] = this.heroService.resetHeroState(possibleChars[j] as IHero);
                possibleChars[j] = this.heroService.calcHero(possibleChars[j] as IHero);
              } else {
                possibleChars[j] = this.heroService.resetPetState(possibleChars[j] as IPet);
              }
              this.applyCharEffects(battle, heroes, possibleChars[j], true, isSimulation);
              if (alliesInRange.find((a) => a === possibleChars[j].id)) {
                mapEffectsToApply.push({
                  effect,
                  target: possibleChars[j]
                });
              }
            }
            break;

          // Map effects
          case '41-void-vortex':
            if (isBeforeTurn) {
              const vortexCaster = this.heroService.getHeroById(effect.casterId, heroes);
              const vortexBuff = this.heroService.getCharEffectById(vortexCaster, effect.id);
              effect.range = vortexBuff.left === 2 ? 1 : 1;
              const vortexPoints = this.mapService.findNearestPoints(
                effect.position,
                battle.scenario.tiles,
                effect.range
              );
              const vortexEnemies = this.getPossibleEnemies(battle, effect.casterId);
              const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
              for (let j = 0; j < vortexEnemies.length; j++) {
                if (
                  ((vortexEnemies[j].isPet && activeHero.pets.find((p) => p.id === vortexEnemies[j].id)) ||
                    (!vortexEnemies[j].isPet && activeHero.id === vortexEnemies[j].id)) &&
                  vortexPoints.find(
                    (vp) => vp.x === vortexEnemies[j].position.x && vp.y === vortexEnemies[j].position.y
                  )
                ) {
                  this.charTakesDamage({
                    battle,
                    caster: vortexCaster,
                    heroes,
                    target: vortexEnemies[j],
                    magicDamage: 4 + vortexCaster.intellect,
                    effectId: effect.id,
                    isSimulation
                  });
                }
              }
            }
            break;
        }
      }

      for (let i = 0; i < mapEffectsToApply.length; i++) {
        this.applyEffect(
          battle,
          heroes,
          mapEffectsToApply[i].target,
          mapEffectsToApply[i].effect,
          isBeforeTurn,
          isSimulation
        );
      }
    }
    this.applyPostEffects(battle, heroes, isBeforeTurn, isSimulation);
  }

  beforeTurn(battle: IBattle, heroes: IHero[], hero: IHero, isSimulation: boolean) {
    if (hero.isDead) {
      return;
    }

    hero = this.heroService.resetHeroState(hero);
    hero = this.heroService.calcHero(hero);
    this.applyCharEffects(battle, heroes, hero, true, isSimulation);

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
        switch (hero.effects[i].id) {
          // Remove Aura effects
          case '43-rallying':
            const rallyingEffectIndex = battle.mapEffects.findIndex((me) => me.id === hero.effects[i].id);
            battle.mapEffects.splice(rallyingEffectIndex, 1);

            const allies = this.getPossibleAllies(battle, hero.effects[i].casterId, false);
            for (let j = 0; j < allies.length; j++) {
              if (!allies[j].isPet) {
                allies[j] = this.heroService.resetHeroState(allies[j] as IHero);
                allies[j] = this.heroService.calcHero(allies[j] as IHero);
              } else {
                allies[j] = this.heroService.resetPetState(allies[j] as IPet);
              }
              this.applyCharEffects(battle, heroes, allies[j], true, isSimulation);
            }
            break;
          case '41-void-vortex':
            const vortexEffectIndex = battle.mapEffects.findIndex((me) => me.id === hero.effects[i].id);
            battle.mapEffects.splice(vortexEffectIndex, 1);
            break;
        }
        hero.effects.splice(i, 1);
      }
    }

    this.applyMapEffects(battle, heroes, true, isSimulation);

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

    this.applyPostEffects(battle, heroes, true, isSimulation);
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
      positionX: activeHero.position.x, //initial position at the new turn beginning (for previousMoves)
      positionY: activeHero.position.y
    });

    this.beforeTurn(battle, heroes, activeHero, isSimulation);
    battle.scenario.beforeTurn(battle);

    if (battle.queue[0]) {
      const newActiveHero = this.heroService.getHeroById(battle.queue[0], heroes);
      if (newActiveHero.isStunned) {
        battle.log.push({
          type: LogMessageType.TURN_SKIP,
          id: newActiveHero.id
        });
        this.endTurn(battle, isSimulation);
      }
    }
    return battle;
  }

  findEnemies(battle: IBattle, sourceCharId: string, radius: number, ignoreRaytrace?: boolean): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar: IChar = this.heroService.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }
    const points = this.mapService.findNearestPoints(sourceChar.position, battle.scenario.tiles, radius);
    const possibleEnemies = this.getPossibleEnemies(battle, sourceCharId);

    const enemies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleEnemies.length; j++) {
        if (
          points[i].x === possibleEnemies[j].position.x &&
          points[i].y === possibleEnemies[j].position.y &&
          !(possibleEnemies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourceChar.position.x, y: sourceChar.position.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
        ) {
          enemies.push(possibleEnemies[j].id);
        }
      }
    }
    return enemies;
  }

  findAllies(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeSelf: boolean,
    ignoreRaytrace?: boolean
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = this.heroService.getHeroById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }
    const points = this.mapService.findNearestPoints(sourceChar.position, battle.scenario.tiles, radius);
    const possibleAllies = this.getPossibleAllies(battle, sourceCharId, includeSelf);

    const allies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleAllies.length; j++) {
        if (
          points[i].x === possibleAllies[j].position.x &&
          points[i].y === possibleAllies[j].position.y &&
          !(possibleAllies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourceChar.position.x, y: sourceChar.position.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
        ) {
          allies.push(possibleAllies[j].id);
        }
      }
    }
    return allies;
  }

  findHeroes(battle: IBattle, sourceCharId: string, radius: number, ignoreRaytrace?: boolean): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = this.heroService.getHeroById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }
    const points = this.mapService.findNearestPoints(sourceChar.position, battle.scenario.tiles, radius);
    const possibleChars: IChar[] = [];

    for (let i = 0; i < heroes.length; i++) {
      // NOT_ME
      if (heroes[i].id !== sourceCharId) {
        possibleChars.push(heroes[i]);
      }
      possibleChars.push(...heroes[i].pets);
    }

    const chars: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleChars.length; j++) {
        if (
          points[i].x === possibleChars[j].position.x &&
          points[i].y === possibleChars[j].position.y &&
          !(possibleChars[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourceChar.position.x, y: sourceChar.position.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
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

    activeHero.energy -= weapon.energyCost + activeHero.extraWeaponEnergyCost;
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

  checkAbilityForUse(ability: IAbility, caster: IChar): boolean {
    if (caster.isStunned) {
      return false;
    }

    if (ability.isPassive) {
      return false;
    }

    if (ability.needWeapon && !(caster as IHero).isImmuneToDisarm && caster.isDisarmed) {
      return false;
    }

    if (ability.isSpell && caster.isSilenced) {
      return false;
    }

    if (ability.targetType === AbilityTargetType.MOVE && caster.isImmobilized) {
      return false;
    }

    if (caster.isPet) {
      return ability.left === 0;
    } else {
      return (
        ability.level <= (caster as IHero).maxAllowedAbilityLevel &&
        ability.left === 0 &&
        (caster as IHero).energy - ability.energyCost >= 0 &&
        (caster as IHero).mana - ability.manaCost >= 0
      );
    }
  }

  checkAbilityAction(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IChar,
    targetId: string,
    position?: IPosition
  ): boolean {
    let target: IChar;
    switch (ability.id) {
      // Paragon
      case '13-shoulder-to-shoulder':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isPet;
      case '33-bandaging':
        target = this.heroService.getCharById(targetId, heroes);
        return target.health < target.maxHealth;

      // Highlander
      case '21-sweeping-strike':
        const sweepingStrikeEnemies = this.findEnemies(battle, caster.id, 2);
        return sweepingStrikeEnemies.length > 0;
      case '42-ancestral-power':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isPet;

      // Druid
      case '22-wolf':
        return (caster as IHero).pets.findIndex((p) => p.id === 'wolf') < 0;
      case '41-wrath-of-nature':
        const wrathOfNatureEnemies = this.findEnemies(battle, caster.id, 3);
        return wrathOfNatureEnemies.length > 0;
      case '42-dryad':
        return (caster as IHero).pets.findIndex((p) => p.id === 'dryad') < 0;

      // Oracle
      case '13-dangerous-knowledge':
        return (caster as IHero).intellect > 0;
      case '21-mind-blow':
        target = this.heroService.getCharById(targetId, heroes);
        let leftCounter = 0;

        if (target.isPet) {
          leftCounter += (target as IPet).ability.left;
        } else {
          for (let i = 0; i < (target as IHero).abilities.length; i++) {
            leftCounter += (target as IHero).abilities[i].left;
          }
        }
        return leftCounter > 0;
      case '22-knowledge-steal':
        target = this.heroService.getCharById(targetId, heroes);
        return !!target.effects.find((e) => e.isBuff && e.isRemovable);
      case '33-mind-control':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isStunned && !target.isImmuneToDebuffs;
      case '43-amnesia':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isPet && !target.isImmuneToDebuffs && (target as IHero).abilities.length > 1;
      default:
        return true;
    }
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

    if (!target || target.health < 1) {
      return 0;
    }

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

    if (target.health <= 0) {
      if (target.isPet) {
        for (let i = 0; i < heroes.length; i++) {
          for (let j = heroes[i].pets.length - 1; j >= 0; j--) {
            if (heroes[i].pets[j].id === target.id) {
              battle.log.push({
                type: LogMessageType.DEATH,
                id: heroes[i].pets[j].id
              });
              target = undefined;
              heroes[i].pets.splice(j, 1);
              break;
            }
          }
        }
      } else {
        this.heroDeath(battle, target as IHero, isSimulation);
      }
    }

    this.afterDamageTaken(battle, caster, heroes, target, healthDamage, isSimulation);

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
    hero.pets = [];
    hero.isDead = true;

    for (let i = battle.mapEffects.length - 1; i >= 0; i--) {
      if (battle.mapEffects[i].casterId === hero.id) {
        battle.mapEffects.splice(i, 1);
      }
    }

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

    if (activeHero.id === 'druid' && this.heroService.getHeroAbilityById(activeHero, '32-war-tree')) {
      physDamage = physDamage + 2;
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
          const enemies = this.findEnemies(battle, activeChar.id, 2);
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
        if (target && target.id === 'oracle' && this.heroService.getHeroAbilityById(target as IHero, '12-reflection')) {
          this.heroService.takeMana(target as IHero, damageValue);
          battle.log.push({
            id: target.id,
            type: LogMessageType.TAKE_MANA,
            value: damageValue + ''
          });
          const enemies = this.findEnemies(battle, target.id, 1);
          for (let i = 0; i < enemies.length; i++) {
            const enemyChar = this.heroService.getCharById(enemies[i], heroes);
            if (enemyChar) {
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
            const enemies = this.findEnemies(battle, activeHero.id, ability.range, ability.ignoreRaytrace);
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, enemies[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  targetId: enemies[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY:
            const allies = this.findAllies(battle, activeHero.id, ability.range, true, ability.ignoreRaytrace);
            for (let j = 0; j < allies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allies[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  targetId: allies[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_NOT_ME:
            const alliesWithoutMe = this.findAllies(
              battle,
              activeHero.id,
              ability.range,
              false,
              ability.ignoreRaytrace
            );
            for (let j = 0; j < alliesWithoutMe.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, alliesWithoutMe[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  targetId: alliesWithoutMe[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY:
            const allHeroes = this.findHeroes(battle, activeHero.id, ability.range, ability.ignoreRaytrace);
            for (let j = 0; j < allHeroes.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allHeroes[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  targetId: allHeroes[j]
                });
              }
            }
            break;
          case AbilityTargetType.SELF:
            if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id)) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: activeHero.id
              });
            }
            break;
          case AbilityTargetType.MOVE:
            const movePoints = this.mapService.getMovePoints(
              activeHero.position,
              ability.range,
              battle.scenario.tiles,
              heroes,
              ability.ignoreRaytrace,
              ability.ignoreObstacles
            );
            for (let j = 0; j < movePoints.length; j++) {
              if (
                previousMoves.length &&
                previousMoves.find((move) => move.x === movePoints[j].x && move.y === movePoints[j].y)
              ) {
                continue;
              }
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id, movePoints[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  positionX: movePoints[j].x,
                  positionY: movePoints[j].y
                });
              }
            }
            break;
          case AbilityTargetType.MAP:
            const mapPoints = this.mapService.getMovePoints(
              activeHero.position,
              ability.range,
              battle.scenario.tiles,
              heroes,
              ability.ignoreRaytrace,
              ability.ignoreObstacles
            );
            for (let j = 0; j < mapPoints.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id, mapPoints[j])) {
                actions.push({
                  type: ActionType.ABILITY,
                  abilityId: ability.id,
                  casterId: activeHero.id,
                  positionX: mapPoints[j].x,
                  positionY: mapPoints[j].y
                });
              }
            }
            break;
        }
      }
    }

    for (let i = 0; i < activeHero.pets.length; i++) {
      if (activeHero.pets[i].isStunned) {
        continue;
      }
      if (this.checkAbilityForUse(activeHero.pets[i].ability, activeHero.pets[i])) {
        switch (activeHero.pets[i].ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(
              battle,
              activeHero.pets[i].id,
              activeHero.pets[i].ability.range,
              activeHero.pets[i].ability.ignoreRaytrace
            );
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, activeHero.pets[i].ability, activeHero.pets[i], enemies[j])) {
                actions.push({
                  type: ActionType.PET_ABILITY,
                  abilityId: activeHero.pets[i].ability.id,
                  casterId: activeHero.pets[i].id,
                  targetId: enemies[j]
                });
              }
            }
            break;
        }
      }
      if (!activeHero.pets[i].isMoved && !activeHero.pets[i].isImmobilized) {
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
            positionX: petMovePoints[j].x,
            positionY: petMovePoints[j].y
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
        positionX: moves[i].x,
        positionY: moves[i].y
      });
    }
    actions.push({ type: ActionType.TURN_END });
    return actions;
  }
}
