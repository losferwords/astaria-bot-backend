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
import { EffectsData } from 'src/static/effects-data';
import { ArchaeanTemple } from 'src/models/scenarios/archaean-temple';
import { ArenaOfAcheos1x1 } from 'src/models/scenarios/arena-of-acheos-1x1';
import { ArenaOfAcheos1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1';
import { ArenaOfAcheos1x1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1x1';
import { ArenaOfAcheos2x2 } from 'src/models/scenarios/arena-of-acheos-2x2';

@Injectable()
export class BattleService {
  battle: IBattle = null;
  setupIndex = -1;

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

  getPossibleEnemies(battle: IBattle, sourceCharId: string): IChar[] {
    const possibleEnemies: IChar[] = [];

    const enemyTeams = battle.teams.filter((team: ITeam) => {
      return !team.heroes.find((hero: IHero) => {
        return hero.id === sourceCharId || hero.pets.find((p) => p.id === sourceCharId);
      });
    });

    for (let i = 0; i < enemyTeams.length; i++) {
      for (let j = 0; j < enemyTeams[i].heroes.length; j++) {
        possibleEnemies.push(enemyTeams[i].heroes[j]);
        possibleEnemies.push(...enemyTeams[i].heroes[j].pets);
      }
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
    const heroes = [];
    for (let i = 0; i < battle.teams.length; i++) {
      for (let j = 0; j < battle.teams[i].heroes.length; j++) {
        heroes.push(battle.teams[i].heroes[j]);
      }
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
    console.log(
      `Start battle, scenario: ${battleSetup.scenarioId}, setup: ${
        battleSetup.setupIndex > -1 ? battleSetup.setupIndex : 'manual'
      }`
    );
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
        break;
      case '1':
        battle = {
          id: uuid(),
          scenario: new ArchaeanTemple(),
          teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
          crystalPositions: [],
          mapEffects: [],
          queue: [],
          log: []
        };
        break;
      case '2':
        battle = {
          id: uuid(),
          scenario: new ArenaOfAcheos1x1(),
          teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
          crystalPositions: [],
          mapEffects: [],
          queue: [],
          log: []
        };
        break;
      case '3':
        battle = {
          id: uuid(),
          scenario: new ArenaOfAcheos1x1x1(),
          teams: [
            new Team(battleSetup.teamSetup[0]),
            new Team(battleSetup.teamSetup[1]),
            new Team(battleSetup.teamSetup[2])
          ],
          crystalPositions: [],
          mapEffects: [],
          queue: [],
          log: []
        };
        break;
      case '4':
        battle = {
          id: uuid(),
          scenario: new ArenaOfAcheos1x1x1x1(),
          teams: [
            new Team(battleSetup.teamSetup[0]),
            new Team(battleSetup.teamSetup[1]),
            new Team(battleSetup.teamSetup[2]),
            new Team(battleSetup.teamSetup[3])
          ],
          crystalPositions: [],
          mapEffects: [],
          queue: [],
          log: []
        };
        break;
      case '5':
        battle = {
          id: uuid(),
          scenario: new ArenaOfAcheos2x2(),
          teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
          crystalPositions: [],
          mapEffects: [],
          queue: [],
          log: []
        };
        break;
    }
    battle.scenario.setHeroPositions(battle.teams);
    battle.queue = this.getQueue(battle.teams);
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    battle.log.push({
      t: LogMessageType.TURN_START,
      id: activeHero.id,
      x: activeHero.position.x,
      y: activeHero.position.y
    });
    for (let i = 0; i < heroes.length; i++) {
      this.beforeTurn(battle, heroes, heroes[i], false);
    }
    battle.scenario.beforeTurn(battle);
    this.battle = battle;
    this.setupIndex = battleSetup.setupIndex;
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
        t: LogMessageType.MOVE,
        x: targetPosition.x,
        y: targetPosition.y,
        id: activeChar.id
      });

      this.afterMoveChar(battle, heroes, activeChar, isSimulation);
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
        t: LogMessageType.TAKE_CRYSTAL,
        id: movedChar.id
      });
      battle.crystalPositions.splice(crystalPositionIndex, 1);
      battle.scenario.afterTakeCrystal(movedChar, battle);
    }
  }

  knockBack(battle: IBattle, heroes: IHero[], target: IChar, charPosition: IPosition, isSimulation: boolean) {
    this.mapService.knockBack(target, charPosition, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, target, isSimulation);
  }

  attraction(battle: IBattle, heroes: IHero[], target: IChar, charPosition: IPosition, isSimulation: boolean) {
    this.mapService.attraction(target, charPosition, battle.scenario.tiles, heroes);
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
      case '41-void-vortex':
      case '43-symbiosis':
      case '41-harmony':
      case '43-fire':
      case '32-sun-aegis':
      case '42-divine-radiance':
      case '32-sand-storm':
      case '33-time-trap':
        //No need to apply, just effect existance
        break;
      case '41-piercing-strike':
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
      case '13-fireball':
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
      case '22-cauterization':
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
      case '43-oblivion':
        if (isBeforeTurn && !char.isPet) {
          let manaDrainValue = 0;
          switch (effect.left) {
            case 3:
              manaDrainValue = 1;
              break;
            case 2:
              manaDrainValue = 2;
              break;
            case 1:
              manaDrainValue = 4;
              break;
          }
          this.heroService.spendMana(char as IHero, manaDrainValue);
        }
        break;
      case '22-quicksands':
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
      default:
        this.effectService.apply(battle, heroes, effect, char, isBeforeTurn);
        break;
    }
  }

  applyCharEffects(battle: IBattle, heroes: IHero[], char: IChar, isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < char.effects.length; i++) {
      this.applyEffect(battle, heroes, char, char.effects[i], isBeforeTurn, isSimulation);
    }
  }

  applyPostEffects(battle: IBattle, heroes: IHero[], isBeforeTurn: boolean, isSimulation: boolean) {
    // For Post Effects we need to track heroes parameters to apply
    let heroWithQuicksands: IHero;

    let heroWithHarmony: IHero;
    let harmonyEffect: IEffect;

    let heroWithSymbiosis: IHero;
    let symbiosisEffect: IEffect;

    let heroWithSunAegis: IHero;
    let sunAegisEffect: IEffect;

    for (let i = 0; i < heroes.length; i++) {
      if (!heroWithQuicksands && this.heroService.getCharEffectById(heroes[i], '22-quicksands')) {
        heroWithQuicksands = heroes[i];
      }

      if (!harmonyEffect) {
        harmonyEffect = this.heroService.getCharEffectById(heroes[i], '41-harmony');
        if (harmonyEffect) {
          heroWithHarmony = heroes[i];
        }
      }

      if (!symbiosisEffect) {
        symbiosisEffect = this.heroService.getCharEffectById(heroes[i], '43-symbiosis');
        if (symbiosisEffect) {
          heroWithSymbiosis = heroes[i];
        }
      }

      if (!sunAegisEffect) {
        sunAegisEffect = this.heroService.getCharEffectById(heroes[i], '32-sun-aegis');
        if (sunAegisEffect) {
          heroWithSunAegis = heroes[i];
        }
      }
    }

    if (heroWithQuicksands) {
      const allies = this.findAllies(battle, heroWithQuicksands.id, 1, false, true, false, false);
      if (allies.length === 0) {
        heroWithQuicksands.isImmobilized = true;
      }
    }

    if (heroWithHarmony) {
      this.effectService.apply(battle, heroes, harmonyEffect, heroWithHarmony, isBeforeTurn);
    }

    if (heroWithSymbiosis) {
      this.effectService.apply(battle, heroes, symbiosisEffect, heroWithSymbiosis, isBeforeTurn);
    }

    for (let i = 0; i < heroes.length; i++) {
      this.heroService.normalizeCharStats(heroes[i]);
      for (let j = heroes[i].pets.length - 1; j >= 0; j--) {
        this.heroService.normalizeCharStats(heroes[i].pets[j]);
      }
    }

    if (isBeforeTurn && heroWithSunAegis && battle.queue[0] === heroWithSunAegis.id) {
      const sunAegisEnemies = this.findEnemies(battle, heroWithSunAegis.id, 2, true, '', false, false);
      for (let i = 0; i < sunAegisEnemies.length; i++) {
        if (!heroWithSunAegis.isDead) {
          const enemyHero = this.heroService.getCharById(sunAegisEnemies[i], heroes);
          this.charTakesDamage({
            battle,
            caster: heroWithSunAegis,
            heroes,
            target: enemyHero,
            effectId: sunAegisEffect.id,
            magicDamage: 3,
            isSimulation
          });
        }
      }
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
          case '21-aura-of-might':
          case '22-aura-of-fortitude':
          case '23-aura-of-light':
            const auraHero = this.heroService.getHeroById(effect.casterId, heroes);
            effect.position = {
              x: auraHero.position.x,
              y: auraHero.position.y
            };
            if (effect.casterId === 'lightbringer') {
              if (this.heroService.getCharEffectById(auraHero, '42-divine-radiance')) {
                effect.range = 3;
              } else {
                effect.range = 2;
              }
            }
            const alliesInRange = this.findAllies(battle, effect.casterId, effect.range, true, true, true, false);

            const possibleChars: IChar[] = [];

            for (let j = 0; j < heroes.length; j++) {
              possibleChars.push(heroes[j]);
              possibleChars.push(...heroes[j].pets);
            }

            for (let j = 0; j < possibleChars.length; j++) {
              if (!possibleChars[j].isPet) {
                this.heroService.resetHeroState(possibleChars[j] as IHero);
                this.heroService.calcHero(possibleChars[j] as IHero);
              } else {
                this.heroService.resetPetState(possibleChars[j] as IPet);
              }
              this.applyCharEffects(battle, heroes, possibleChars[j], false, isSimulation);

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
            if (isBeforeTurn && battle.queue[0] === effect.casterId) {
              const vortexCaster = this.heroService.getHeroById(effect.casterId, heroes);
              const vortexPoints = this.mapService.findNearestPoints(
                effect.position,
                battle.scenario.tiles,
                effect.range
              );
              const vortexEnemies = this.getPossibleEnemies(battle, effect.casterId);
              for (let j = 0; j < vortexEnemies.length; j++) {
                if (vortexEnemies[j] && vortexEnemies[j].health > 0) {
                  this.attraction(battle, heroes, vortexEnemies[j], effect.position, isSimulation);
                  // Rest mapEffectsToApply could be ignored,
                  // because after attraction map effects will be already applied
                  mapEffectsToApply.length = 0;
                  if (
                    vortexPoints.find(
                      (vp) => vp.x === vortexEnemies[j].position.x && vp.y === vortexEnemies[j].position.y
                    )
                  ) {
                    this.charTakesDamage({
                      battle,
                      caster: vortexCaster,
                      heroes,
                      target: vortexEnemies[j],
                      magicDamage: 2,
                      effectId: effect.id,
                      isSimulation
                    });
                  }
                }
              }
            }
            break;
          case '43-fire':
            if (isBeforeTurn && battle.queue[0] === effect.casterId) {
              const fireCaster = this.heroService.getHeroById(effect.casterId, heroes);
              const fireBuff = this.heroService.getCharEffectById(fireCaster, effect.id);
              switch (fireBuff.left) {
                case 2:
                  effect.range = 2;
                  break;
                case 1:
                  effect.range = 3;
                  break;
                case 0:
                  effect.range = 4;
                  break;
              }
              const firePoints = this.mapService.findNearestPoints(
                effect.position,
                battle.scenario.tiles,
                effect.range
              );
              const fireEnemies = this.getPossibleEnemies(battle, effect.casterId);
              for (let j = 0; j < fireEnemies.length; j++) {
                if (
                  fireEnemies[j] &&
                  fireEnemies[j].health > 0 &&
                  firePoints.find((fp) => fp.x === fireEnemies[j].position.x && fp.y === fireEnemies[j].position.y)
                ) {
                  this.charTakesDamage({
                    battle,
                    caster: fireCaster,
                    heroes,
                    target: fireEnemies[j],
                    magicDamage: 2,
                    effectId: effect.id,
                    isSimulation
                  });
                }
              }
            }
            break;
          case '32-sand-storm':
            const sandStormCaster = this.heroService.getHeroById(effect.casterId, heroes);
            const sandStormPoints = this.mapService.findNearestPoints(
              effect.position,
              battle.scenario.tiles,
              effect.range
            );
            const sandStormEnemies = this.getPossibleEnemies(battle, effect.casterId);

            const sandStormPossibleChars: IChar[] = [];

            for (let j = 0; j < heroes.length; j++) {
              sandStormPossibleChars.push(heroes[j]);
              sandStormPossibleChars.push(...heroes[j].pets);
            }

            // Reset states
            for (let j = 0; j < sandStormPossibleChars.length; j++) {
              if (!sandStormPossibleChars[j].isPet) {
                this.heroService.resetHeroState(sandStormPossibleChars[j] as IHero);
                this.heroService.calcHero(sandStormPossibleChars[j] as IHero);
              } else {
                this.heroService.resetPetState(sandStormPossibleChars[j] as IPet);
              }
              this.applyCharEffects(battle, heroes, sandStormPossibleChars[j], false, isSimulation);
            }

            // Apply sand storm
            for (let j = 0; j < sandStormEnemies.length; j++) {
              if (
                sandStormEnemies[j] &&
                sandStormEnemies[j].health > 0 &&
                sandStormPoints.find(
                  (ssp) => ssp.x === sandStormEnemies[j].position.x && ssp.y === sandStormEnemies[j].position.y
                )
              ) {
                if (isBeforeTurn && battle.queue[0] === effect.casterId) {
                  this.charTakesDamage({
                    battle,
                    caster: sandStormCaster,
                    heroes,
                    target: sandStormEnemies[j],
                    directDamage: 2,
                    effectId: effect.id,
                    isSimulation
                  });
                }

                mapEffectsToApply.push({
                  effect: {
                    id: '32-sand-storm-blind',
                    duration: 0,
                    isBuff: false,
                    isRemovable: false
                  },
                  target: sandStormEnemies[j]
                });
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

    for (let i = hero.effects.length - 1; i > -1; i--) {
      if (!hero.effects[i]) {
        console.log(hero.id, hero.effects, i);
        continue;
      }
      if (hero.effects[i].left > 0 && hero.effects[i].left < 100) {
        hero.effects[i].left--;
      } else {
        switch (hero.effects[i].id) {
          // Remove Aura effects
          case '43-rallying':
          case '32-sand-storm':
            const rallyingEffectIndex = battle.mapEffects.findIndex((me) => me.id === hero.effects[i].id);
            battle.mapEffects.splice(rallyingEffectIndex, 1);

            const allies = this.getPossibleAllies(battle, hero.effects[i].casterId, false);
            for (let j = 0; j < allies.length; j++) {
              if (!allies[j].isPet) {
                this.heroService.resetHeroState(allies[j] as IHero);
                this.heroService.calcHero(allies[j] as IHero);
              } else {
                this.heroService.resetPetState(allies[j] as IPet);
              }
              this.applyCharEffects(battle, heroes, allies[j], true, isSimulation);
            }
            hero.effects.splice(i, 1);
            break;
          case '41-void-vortex':
          case '43-fire':
            const mapEffectIndex = battle.mapEffects.findIndex((me) => me.id === hero.effects[i].id);
            battle.mapEffects.splice(mapEffectIndex, 1);
            hero.effects.splice(i, 1);
            break;
          case '32-elements-control':
            // Do nothing
            break;
          default:
            hero.effects.splice(i, 1);
        }
      }
    }

    for (let i = 0; i < hero.pets.length; i++) {
      hero.pets[i].isMoved = false;
      if (hero.pets[i].health + hero.pets[i].regeneration < hero.pets[i].maxHealth) {
        hero.pets[i].health += hero.pets[i].regeneration;
      } else {
        hero.pets[i].health = hero.pets[i].maxHealth;
      }

      if (!hero.pets[i].ability) {
        continue;
      }

      if (hero.pets[i].ability.left > 0) {
        hero.pets[i].ability.left--;
      }

      for (let j = hero.pets[i].effects.length - 1; j > -1; j--) {
        if (!hero.pets[i].effects[j]) {
          continue;
        }
        if (hero.pets[i].effects[j].left > 0) {
          hero.pets[i].effects[j].left--;
        } else {
          hero.pets[i].effects.splice(j, 1);
        }
      }
      this.heroService.resetPetState(hero.pets[i]);
      this.applyCharEffects(battle, heroes, hero.pets[i], true, isSimulation);
    }

    this.heroService.resetHeroState(hero);
    this.heroService.calcHero(hero);
    this.applyCharEffects(battle, heroes, hero, true, isSimulation);

    if (hero.isDead) {
      return; // check again because after DOT hero can die
    }

    if (this.heroService.getCharEffectById(hero, '33-time-trap')) {
      hero.energy = hero.maxEnergy / 2;
    } else {
      hero.energy = hero.maxEnergy;
    }

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

    hero.primaryWeapon.isUsed = false;
    if (hero.secondaryWeapon && !hero.secondaryWeapon.isPassive) {
      hero.secondaryWeapon.isUsed = false;
    }

    this.applyMapEffects(battle, heroes, true, isSimulation);
  }

  endTurn(battle: IBattle, isSimulation: boolean): IBattle {
    battle.log.push({
      t: LogMessageType.TURN_END,
      id: battle.queue[0]
    });
    battle.queue.push(battle.queue.shift());
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    battle.log.push({
      t: LogMessageType.TURN_START,
      id: activeHero.id,
      x: activeHero.position.x, //initial position at the new turn beginning (for previousMoves)
      y: activeHero.position.y
    });

    this.beforeTurn(battle, heroes, activeHero, isSimulation);
    battle.scenario.beforeTurn(battle);

    if (battle.queue[0] && battle.queue.length > 1) {
      const newActiveHero = this.heroService.getHeroById(battle.queue[0], heroes);
      if (newActiveHero.isStunned) {
        battle.log.push({
          t: LogMessageType.TURN_SKIP,
          id: newActiveHero.id
        });
        this.endTurn(battle, isSimulation);
      }
    }
    return battle;
  }

  findEnemies(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeInvisible: boolean,
    abilityId: string,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar: IChar = this.heroService.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }
    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = this.mapService.findNearestPoints(
      sourcePositionPoint,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleEnemies = this.getPossibleEnemies(battle, sourceCharId);

    const enemies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleEnemies.length; j++) {
        if (
          points[i].x === possibleEnemies[j].position.x &&
          points[i].y === possibleEnemies[j].position.y &&
          (includeInvisible || !(possibleEnemies[j] as IHero).isInvisible) &&
          !(abilityId === '41-headshot' && possibleEnemies[j].health >= 10) &&
          !(possibleEnemies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
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
    includeInvisible: boolean,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = this.heroService.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }

    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = this.mapService.findNearestPoints(
      sourcePositionPoint,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleAllies = this.getPossibleAllies(battle, sourceCharId, includeSelf);

    const allies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleAllies.length; j++) {
        if (
          points[i].x === possibleAllies[j].position.x &&
          points[i].y === possibleAllies[j].position.y &&
          (includeInvisible || !(possibleAllies[j] as IHero).isInvisible) &&
          !(possibleAllies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
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

  findHeroes(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeSelf: boolean,
    includeInvisible: boolean,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = this.heroService.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }

    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = this.mapService.findNearestPoints(
      sourcePosition || sourceChar.position,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleChars: IChar[] = [];

    for (let i = 0; i < heroes.length; i++) {
      if (heroes[i].id === sourceCharId) {
        if (includeSelf) {
          possibleChars.push(heroes[i]);
        }
      } else {
        possibleChars.push(heroes[i]);
      }
      possibleChars.push(...heroes[i].pets);
    }

    const chars: string[] = [];
    const sourceCharTeamId = this.heroService.getTeamByCharId(sourceCharId, battle.teams).id;

    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleChars.length; j++) {
        const possibleCharTeamId = this.heroService.getTeamByCharId(possibleChars[j].id, battle.teams).id;
        if (
          points[i].x === possibleChars[j].position.x &&
          points[i].y === possibleChars[j].position.y &&
          ((includeInvisible && sourceCharTeamId === possibleCharTeamId) || !(possibleChars[j] as IHero).isInvisible) &&
          !(possibleChars[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !this.mapService.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
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

    let energyCost = weapon.energyCost + activeHero.extraWeaponEnergyCost;
    if (energyCost < 0) {
      energyCost = 0;
    }

    activeHero.energy -= energyCost;
    if (!this.heroService.getCharEffectById(activeHero, '41-excellence')) {
      weapon.isUsed = true;
    }

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
      t: LogMessageType.WIN,
      id: winnerHeroes
    });
  }

  upgradeEquip(battle: IBattle, equipId: string, isSimulation: boolean): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);

    battle = this.heroService.upgradeEquip(battle, heroes, equipId);
    this.applyCharEffects(battle, heroes, activeHero, false, isSimulation);
    this.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  learnAbility(battle: IBattle, abilityId: string, isSimulation: boolean): IBattle {
    let activeHero: IHero;
    const heroes = this.getHeroesInBattle(battle);
    battle = this.heroService.learnAbility(battle, heroes, abilityId);
    switch (abilityId) {
      case '13-lightning-rod':
      case '32-war-tree':
      case '21-flame-claws':
        activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
        this.heroService.resetHeroState(activeHero);
        this.heroService.calcHero(activeHero);
        this.applyCharEffects(battle, heroes, activeHero, false, isSimulation);
        break;
      case '21-aura-of-might':
      case '22-aura-of-fortitude':
      case '23-aura-of-light':
        activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
        const auraEffect: IEffect = { ...EffectsData[abilityId] };

        auraEffect.left = auraEffect.duration;
        auraEffect.casterId = activeHero.id;
        battle.mapEffects.push(auraEffect);

        this.applyMapEffects(battle, heroes, false, isSimulation);
        break;
    }
    return battle;
  }

  checkAbilityForUse(ability: IAbility, caster: IChar): boolean {
    if (caster.isStunned) {
      return false;
    }

    if (ability.isPassive) {
      return false;
    }

    if (ability.needWeapon && !caster.isImmuneToDisarm && caster.isDisarmed) {
      return false;
    }

    if (ability.isSpell && caster.isSilenced) {
      return false;
    }

    if (ability.targetType === AbilityTargetType.MOVE && caster.isImmobilized) {
      return false;
    }

    if (
      ability.targetType === AbilityTargetType.MAP &&
      !caster.isPet &&
      (caster as IHero).pets.find((pet) => pet.id === ability.id.split('-').splice(1).join('-'))
    ) {
      return false;
    }

    if (caster.isPet) {
      return ability.left === 0;
    } else {
      switch (ability.id) {
        case '32-elements-control':
          if (this.heroService.getCharEffectById(caster, '32-elements-control')) {
            return false;
          }
          break;
        case '31-assault':
        case '43-rallying':
        case '12-flame-dash':
          if (caster.isImmobilized) {
            return false;
          }
          break;
      }
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
    position; //not used for current abilities set

    switch (ability.id) {
      // Paragon
      case '11-sunder-armor':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '12-shield-bash':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).secondaryWeapon.level + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '13-shoulder-to-shoulder':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isPet;
      case '21-spear-throw':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '33-bandaging':
        target = this.heroService.getCharById(targetId, heroes);
        return target.health < target.maxHealth;
      case '41-piercing-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '42-breakthrough':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).secondaryWeapon.level + 4 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Highlander
      case '21-sweeping-strike':
        const sweepingStrikeEnemies = this.findEnemies(battle, caster.id, 2, true, '21-sweeping-strike', false, false);
        for (let i = 0; i < sweepingStrikeEnemies.length; i++) {
          const sweepingStrikeTarget = this.heroService.getCharById(sweepingStrikeEnemies[i], heroes);
          if (sweepingStrikeTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              (caster as IHero).strength -
              (sweepingStrikeTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '31-halving':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '32-thunderer':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '33-lightning-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '41-decapitation':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '42-ancestral-power':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isPet;
      case '43-chain-lightning':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        }

        const chainLightningAoeEnemies = this.findEnemies(
          battle,
          caster.id,
          2,
          true,
          ability.id,
          false,
          false,
          target.position
        );
        for (let i = 0; i < chainLightningAoeEnemies.length; i++) {
          if (chainLightningAoeEnemies[i] !== targetId) {
            const chainLightningAoeTarget = this.heroService.getCharById(chainLightningAoeEnemies[i], heroes);
            if (chainLightningAoeTarget.isPet) {
              return true;
            } else {
              const magicDamageToHealth = 4 + (caster as IHero).intellect - (chainLightningAoeTarget as IHero).will;
              if (magicDamageToHealth > 0) {
                return true;
              }
            }
          }
        }
        const chainLightningDamageToHealth = 5 + (caster as IHero).intellect - (target as IHero).will;
        if (chainLightningDamageToHealth > 0) {
          return true;
        }
        return false;

      // Druid
      case '11-crown-of-thorns':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '12-poison-touch':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '21-entangling-roots':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '22-wolf-bite':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 4;

          if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 3;
          }
          const physDamageToHealth = abilityDamage - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '31-choking-vine':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 3 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '41-wrath-of-nature':
        const wrathOfNatureEnemies = this.findEnemies(battle, caster.id, 3, true, '41-wrath-of-nature', false, false);
        return wrathOfNatureEnemies.length > 0;
      case '42-dryad-forest-wrath':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 6;

          if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 3;
          }
          const magicDamageToHealth = abilityDamage - (target as IHero).will;
          return magicDamageToHealth > 0 || (target as IHero).mana > 0;
        }

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
        if (leftCounter > 0) {
          const magicDamageToHealth = leftCounter + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        } else {
          return false;
        }
      case '22-knowledge-steal':
        target = this.heroService.getCharById(targetId, heroes);
        return !!target.effects.find((e) => e.isBuff && e.isRemovable);
      case '23-paranoia':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-disruption':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth =
            Math.ceil((caster as IHero).mana / 2) + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '33-mind-control':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isStunned && !target.isImmuneToDebuffs;
      case '43-amnesia':
        target = this.heroService.getCharById(targetId, heroes);
        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Avatar
      case '11-furious-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '13-fireball':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 1 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '23-scorch':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 3 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-dragon-tail':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '33-meteor':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        }

        const meteorAoeEnemies = this.findEnemies(
          battle,
          caster.id,
          1,
          true,
          ability.id,
          false,
          false,
          target.position
        );
        for (let i = 0; i < meteorAoeEnemies.length; i++) {
          if (meteorAoeEnemies[i] !== targetId) {
            const meteorAoeTarget = this.heroService.getCharById(meteorAoeEnemies[i], heroes);
            if (meteorAoeTarget.isPet) {
              return true;
            } else {
              const magicDamageToHealth = 1 + (caster as IHero).intellect - (meteorAoeTarget as IHero).will;
              if (magicDamageToHealth > 0) {
                return true;
              }
            }
          }
        }
        const meteorDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
        if (meteorDamageToHealth > 0) {
          return true;
        }
        return false;
      case '42-dragon-spirit-breath':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 5;

          if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 3;
          }

          const aoeEnemies = this.findEnemies(battle, caster.id, 1, true, ability.id, false, false, target.position);

          for (let i = 0; i < aoeEnemies.length; i++) {
            if (aoeEnemies[i] !== target.id) {
              const aoeTarget = this.heroService.getCharById(aoeEnemies[i], heroes);
              if (aoeTarget.isPet) {
                return true;
              } else {
                const magicDamageToHealth = abilityDamage - (aoeTarget as IHero).will;
                if (magicDamageToHealth > 0) {
                  return true;
                }
              }
            }
          }

          const breathDamageToHealth = abilityDamage - (target as IHero).will;
          if (breathDamageToHealth > 0) {
            return true;
          }
          return false;
        }

      // Shadow
      case '11-aimed-shot':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '13-debilitating-shot':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '21-rapid-fire':
        return (
          (caster as IHero).primaryWeapon.isUsed &&
          (caster as IHero).energy >= (caster as IHero).primaryWeapon.energyCost
        );
      case '23-blind':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-volley':
        const volleyEnemies = this.findEnemies(battle, caster.id, 3, true, ability.id, false, false);
        for (let i = 0; i < volleyEnemies.length; i++) {
          const volleyTarget = this.heroService.getCharById(volleyEnemies[i], heroes);
          if (volleyTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              2 +
              (caster as IHero).strength -
              (volleyTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '41-headshot':
        target = this.heroService.getCharById(targetId, heroes);
        return target.health < 10;
      case '42-phantom-imitation-shot':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const shadow = this.heroService.getHeroById('shadow', heroes);

          let abilityDamage = shadow.primaryWeapon.physDamage + shadow.strength;

          if (this.heroService.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 3;
          }
          const physDamageToHealth = abilityDamage - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '43-oblivion':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 5 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Lightbringer
      case '11-sun-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '13-sun-touch':
        target = this.heroService.getCharById(targetId, heroes);
        const casterTeamForSunTouch = this.heroService.getTeamByHeroId(caster.id, battle.teams);
        const targetTeamForSunTouch = this.heroService.getTeamByCharId(target.id, battle.teams);
        if (casterTeamForSunTouch.id === targetTeamForSunTouch.id) {
          return target.health < target.maxHealth;
        } else {
          if (target.isPet) {
            return true;
          } else {
            const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
            return magicDamageToHealth > 0;
          }
        }
      case '31-retribution':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 1 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '33-cleansing':
        target = this.heroService.getCharById(targetId, heroes);
        const casterTeamForCleansing = this.heroService.getTeamByHeroId(caster.id, battle.teams);
        const targetTeamForCleansing = this.heroService.getTeamByCharId(target.id, battle.teams);
        if (casterTeamForCleansing.id === targetTeamForCleansing.id) {
          return !!target.effects.find((e) => !e.isBuff);
        } else {
          return !!target.effects.find((e) => e.isBuff);
        }
      case '41-hammer-of-wrath':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 2 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '43-sunrise':
        if ((caster as IHero).intellect > 0) {
          const sunriseAllies = this.findAllies(battle, caster.id, 3, true, true, true, false);
          for (let i = 0; i < sunriseAllies.length; i++) {
            const sunriseAlly = this.heroService.getCharById(sunriseAllies[i], heroes);
            if (sunriseAlly.health < sunriseAlly.maxHealth) {
              return true;
            }
          }
        }
        return false;

      // Avenger
      case '11-double-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).strength -
            (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '12-desert-revenge':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).intellect -
            (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '13-fit-of-energy':
        return (
          (caster as IHero).energy <= (caster as IHero).maxEnergy - 4 ||
          (caster as IHero).mana <= (caster as IHero).maxMana - 3
        );
      case '21-precise-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let targetArmor = (target as IHero).armor - (caster as IHero).intellect;
          if (targetArmor < 0) {
            targetArmor = 0;
          }
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            1 +
            (caster as IHero).strength -
            targetArmor;
          return physDamageToHealth > 0;
        }
      case '22-quicksands':
        target = this.heroService.getCharById(targetId, heroes);
        return !target.isImmuneToDebuffs;
      case '23-temporal-strike':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).strength -
            (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-blade-storm':
        const bladeStormEnemies = this.findEnemies(battle, caster.id, 1, true, ability.id, false, false);
        for (let i = 0; i < bladeStormEnemies.length; i++) {
          const bladeStormTarget = this.heroService.getCharById(bladeStormEnemies[i], heroes);
          if (bladeStormTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              (caster as IHero).secondaryWeapon.physDamage +
              2 +
              (caster as IHero).strength -
              (bladeStormTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '33-time-trap':
        target = this.heroService.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '43-sands-of-time':
        return (
          (caster as IHero).energy < (caster as IHero).maxEnergy ||
          (caster as IHero).mana < (caster as IHero).maxMana ||
          (caster as IHero).primaryWeapon.isUsed ||
          (caster as IHero).secondaryWeapon.isUsed
        );
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

    this.heroService.normalizeCharStats(caster);
    this.heroService.normalizeCharStats(target);

    if ((target as IHero).isDead) {
      return 0;
    }
    if (physDamage > 0) {
      const casterStrength = caster.isPet ? 0 : (caster as IHero).strength;
      let targetArmor = target.isPet ? 0 : (target as IHero).armor;
      if (abilityId === '21-precise-strike') {
        targetArmor = targetArmor - (caster as IHero).intellect;
        if (targetArmor < 0) {
          targetArmor = 0;
        }
      }
      const totalPhysDamage = physDamage + casterStrength - targetArmor;
      healthDamage += totalPhysDamage > 0 ? totalPhysDamage : 0;
    }
    if (magicDamage > 0) {
      const casterIntellect = caster.isPet ? 0 : (caster as IHero).intellect;
      const targetWill = target.isPet ? 0 : (target as IHero).will;
      const totalMagicDamage = magicDamage + casterIntellect - targetWill;
      healthDamage += totalMagicDamage > 0 ? totalMagicDamage : 0;
    }
    if (directDamage > 0) {
      healthDamage += directDamage;
    }

    if (healthDamage < 0) {
      healthDamage = 0;
    }

    const battleLogMessage: ILogMessage = {
      c: caster.id,
      tr: target.id,
      v: healthDamage + '',
      t: weaponId
        ? LogMessageType.WEAPON_DAMAGE
        : abilityId
        ? LogMessageType.ABILITY_DAMAGE
        : LogMessageType.EFFECT_DAMAGE
    };

    if (weaponId) {
      battleLogMessage.e = weaponId;
    } else if (abilityId || effectId) {
      battleLogMessage.a = abilityId || effectId;
    }

    battle.log.push(battleLogMessage);

    if (healthDamage === 0) {
      return 0;
    }
    target.health -= healthDamage;

    if (target.health < 1) {
      if (target.isPet) {
        for (let i = 0; i < heroes.length; i++) {
          for (let j = heroes[i].pets.length - 1; j >= 0; j--) {
            if (target && heroes[i].pets[j].id === target.id) {
              battle.log.push({
                t: LogMessageType.DEATH,
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
    hero.isDead = true;

    for (let i = 0; i < hero.pets.length; i++) {
      hero.pets[i].health = 0;
    }

    hero.pets = [];

    for (let i = battle.mapEffects.length - 1; i >= 0; i--) {
      if (battle.mapEffects[i].casterId === hero.id) {
        battle.mapEffects.splice(i, 1);
      }
    }

    battle.log.push({
      t: LogMessageType.DEATH,
      id: hero.id
    });

    let queueIndex = battle.queue.findIndex((heroId: string) => {
      return hero.id === heroId;
    });

    if (queueIndex === 0) {
      if (battle.queue.length > 1) {
        this.endTurn(battle, isSimulation);
      }
      queueIndex = battle.queue.findIndex((heroId: string) => {
        return hero.id === heroId;
      });
    }

    battle.queue.splice(queueIndex, 1);
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
      if (!isSimulation && this.setupIndex > -1) {
        this.battle = null;
        this.reportService.saveBattleResults(battle, this.setupIndex);
        this.reportService.addToStatistics(battle, winner, this.setupIndex);
        this.setupIndex = -1;
      }
    }
  }

  calculateWeaponDamage(weapon: IEquip, activeHero: IHero): { physDamage: number; magicDamage: number } {
    let physDamage = weapon.physDamage || 0;
    let magicDamage = weapon.magicDamage || 0;

    if (activeHero.id === 'highlander' && this.heroService.getHeroAbilityById(activeHero, '13-lightning-rod')) {
      magicDamage = magicDamage + 2;
    }

    if (activeHero.id === 'druid' && this.heroService.getHeroAbilityById(activeHero, '32-war-tree')) {
      physDamage = physDamage + 2;
      magicDamage = magicDamage + 2;
    }

    if (activeHero.id === 'avatar' && this.heroService.getHeroAbilityById(activeHero, '21-flame-claws')) {
      magicDamage = magicDamage + 1;
    }

    if (activeHero.id === 'lightbringer' && this.heroService.getCharEffectById(activeHero, '32-sun-aegis')) {
      magicDamage = magicDamage + 3;
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
          const enemies = this.findEnemies(battle, activeChar.id, 1, false, '22-counterattack', false, false);
          for (let i = 0; i < enemies.length; i++) {
            if (enemies[i] === 'paragon') {
              const paragon = this.heroService.getHeroById(enemies[i], heroes);
              if (
                !paragon.isDead &&
                !paragon.isDisarmed &&
                this.heroService.getHeroAbilityById(paragon, passiveAbility)
              ) {
                this.charTakesDamage({
                  battle,
                  caster: paragon,
                  heroes,
                  target: activeChar,
                  abilityId: passiveAbility,
                  physDamage: paragon.primaryWeapon.physDamage,
                  isSimulation
                });
              }
              break;
            }
          }
        }
        break;
      case '12-reflection':
        if (
          target &&
          target.id === 'oracle' &&
          !(target as IHero).isDead &&
          this.heroService.getHeroAbilityById(target as IHero, '12-reflection')
        ) {
          this.heroService.takeMana(target as IHero, damageValue);
          battle.log.push({
            id: target.id,
            t: LogMessageType.TAKE_MANA,
            v: damageValue + ''
          });
          const enemies = this.findEnemies(battle, target.id, 1, true, '12-reflection', true, false);
          for (let i = 0; i < enemies.length; i++) {
            const enemyChar = this.heroService.getCharById(enemies[i], heroes);
            if (enemyChar) {
              this.charTakesDamage({
                battle,
                caster: target,
                heroes,
                target: enemyChar,
                abilityId: passiveAbility,
                magicDamage: 2,
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
          t: ActionType.LEARN_ABILITY,
          a: heroData.abilities[i].id
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
            t: ActionType.LEARN_ABILITY,
            a: heroData.abilities[i].id
          });
        }
      }

      if (
        activeHero.primaryWeapon.level < 3 &&
        (team.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost ||
          activeHero.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.primaryWeapon.id
        });
      }
      if (
        activeHero.secondaryWeapon &&
        activeHero.secondaryWeapon.level < 3 &&
        (team.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost ||
          activeHero.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.secondaryWeapon.id
        });
      }
      if (
        activeHero.chestpiece.level < 3 &&
        (team.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost ||
          activeHero.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.chestpiece.id
        });
      }
    }

    for (let i = 0; i < activeHero.abilities.length; i++) {
      if (this.checkAbilityForUse(activeHero.abilities[i], activeHero)) {
        const ability = activeHero.abilities[i];
        switch (ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(
              battle,
              activeHero.id,
              ability.range,
              ability.includeInvisible,
              ability.id,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, enemies[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: enemies[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY:
            const allies = this.findAllies(
              battle,
              activeHero.id,
              ability.range,
              true,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allies[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allies[j]
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
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < alliesWithoutMe.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, alliesWithoutMe[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: alliesWithoutMe[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY:
            const allHeroes = this.findHeroes(
              battle,
              activeHero.id,
              ability.range,
              true,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allHeroes.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allHeroes[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allHeroes[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY_NOT_ME:
            const allHeroesWithoutMe = this.findHeroes(
              battle,
              activeHero.id,
              ability.range,
              false,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allHeroesWithoutMe.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allHeroesWithoutMe[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allHeroesWithoutMe[j]
                });
              }
            }
            break;
          case AbilityTargetType.SELF:
            if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id)) {
              actions.push({
                t: ActionType.ABILITY,
                a: ability.id,
                c: activeHero.id,
                tr: activeHero.id
              });
            }
            break;
          case AbilityTargetType.MOVE:
            const movePoints = this.mapService.getMovePoints(
              activeHero.position,
              activeHero.isBlind ? 1 : ability.range,
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
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  x: movePoints[j].x,
                  y: movePoints[j].y
                });
              }
            }
            break;
          case AbilityTargetType.MAP:
            const mapPoints = this.mapService.getMovePoints(
              activeHero.position,
              activeHero.isBlind ? 1 : ability.range,
              battle.scenario.tiles,
              heroes,
              ability.ignoreRaytrace,
              ability.ignoreObstacles
            );
            for (let j = 0; j < mapPoints.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id, mapPoints[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  x: mapPoints[j].x,
                  y: mapPoints[j].y
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
              activeHero.pets[i].ability.includeInvisible,
              activeHero.pets[i].ability.id,
              activeHero.pets[i].ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, activeHero.pets[i].ability, activeHero.pets[i], enemies[j])) {
                actions.push({
                  t: ActionType.PET_ABILITY,
                  a: activeHero.pets[i].ability.id,
                  c: activeHero.pets[i].id,
                  tr: enemies[j]
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
            t: ActionType.PET_MOVE,
            c: activeHero.pets[i].id,
            x: petMovePoints[j].x,
            y: petMovePoints[j].y
          });
        }
      }
    }

    if (this.heroService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range, false, '', false, true);
      for (let i = 0; i < enemies.length; i++) {
        const target = this.heroService.getCharById(enemies[i], heroes);
        let shouldBeAdded = false;

        if (target.isPet) {
          shouldBeAdded = true;
        } else {
          const { physDamage, magicDamage } = this.calculateWeaponDamage(activeHero.primaryWeapon, activeHero);
          const physDamageToHealth = physDamage + activeHero.strength - (target as IHero).armor;
          const magicDamageToHealth = magicDamage + activeHero.intellect - (target as IHero).will;
          shouldBeAdded = physDamageToHealth > 0 || magicDamageToHealth > 0;
        }

        if (shouldBeAdded) {
          actions.push({
            t: ActionType.WEAPON_DAMAGE,
            e: activeHero.primaryWeapon.id,
            c: activeHero.id,
            tr: enemies[i]
          });
        }
      }
    }
    if (activeHero.secondaryWeapon && this.heroService.canUseWeapon(activeHero, activeHero.secondaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.secondaryWeapon.range, false, '', false, true);
      for (let i = 0; i < enemies.length; i++) {
        const target = this.heroService.getCharById(enemies[i], heroes);
        let shouldBeAdded = false;

        if (target.isPet) {
          shouldBeAdded = true;
        } else {
          const { physDamage, magicDamage } = this.calculateWeaponDamage(activeHero.secondaryWeapon, activeHero);
          const physDamageToHealth = physDamage + activeHero.strength - (target as IHero).armor;
          const magicDamageToHealth = magicDamage + activeHero.intellect - (target as IHero).will;
          shouldBeAdded = physDamageToHealth > 0 || magicDamageToHealth > 0;
        }

        if (shouldBeAdded) {
          actions.push({
            t: ActionType.WEAPON_DAMAGE,
            e: activeHero.secondaryWeapon.id,
            c: activeHero.id,
            tr: enemies[i]
          });
        }
      }
    }

    const moves = this.getMovePoints(battle);
    for (let i = 0; i < moves.length; i++) {
      if (previousMoves.length && previousMoves.find((move) => move.x === moves[i].x && move.y === moves[i].y)) {
        continue;
      }
      actions.push({
        t: ActionType.MOVE,
        x: moves[i].x,
        y: moves[i].y
      });
    }

    if (
      actions.length === 0 ||
      activeHero.energy === 0 ||
      (team.crystals > 0 && team.heroes.filter((h) => !h.isDead).length > 1)
    ) {
      actions.push({ t: ActionType.TURN_END });
    }

    return actions;
  }
}
