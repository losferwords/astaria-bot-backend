import { Injectable } from '@nestjs/common';
import { v1 as uuid } from 'uuid';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IHero } from 'src/interfaces/IHero';
import { ITeam } from 'src/interfaces/ITeam';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';
import { Team } from 'src/models/Team';
import { Const } from 'src/static/const';
import { IBattleSetupDto } from 'src/dto/battle-setup.dto';
import { ReportService } from './report.service';
import { IPosition } from 'src/interfaces/IPosition';
import { IEffect } from 'src/interfaces/IEffect';
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
import MapHelper from 'src/helpers/map.helper';
import CharHelper from 'src/helpers/char.helper';
import EffectHelper from 'src/helpers/effect.helper';
import BattleHelper from 'src/helpers/battle.helper';

@Injectable()
export class BattleService {
  battle: IBattle = null;
  setupIndex = -1;

  constructor(private reportService: ReportService) {}

  recalculateChar(battle: IBattle, heroes: IHero[], char: IChar, isBeforeTurn: boolean, isSimulation: boolean) {
    if (!char.isPet) {
      CharHelper.resetHeroState(char as IHero);
      CharHelper.calcHero(char as IHero);
    } else {
      CharHelper.resetPetState(char as IPet);
    }
    this.applyCharEffects(battle, heroes, char, isBeforeTurn, isSimulation);
  }

  applyCharEffects(battle: IBattle, heroes: IHero[], char: IChar, isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < char.effects.length; i++) {
      this.applyEffect(battle, heroes, char, char.effects[i], isBeforeTurn, isSimulation);
    }
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
            caster: CharHelper.getHeroById(effect.casterId, heroes),
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
            caster: CharHelper.getHeroById(effect.casterId, heroes),
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
            caster: CharHelper.getHeroById(effect.casterId, heroes),
            heroes,
            target: char,
            directDamage: 1,
            effectId: effect.id,
            isSimulation
          });
        }
        EffectHelper.apply(battle, heroes, effect, char, isBeforeTurn);
        break;
      case '33-mind-control':
        if (isSimulation) {
          EffectHelper.apply(battle, heroes, effect, char, isBeforeTurn);
        }
        break;
      case '13-fireball':
        if (isBeforeTurn) {
          this.charTakesDamage({
            battle,
            caster: CharHelper.getHeroById(effect.casterId, heroes),
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
            caster: CharHelper.getHeroById(effect.casterId, heroes),
            heroes,
            target: char,
            directDamage: 1,
            effectId: effect.id,
            isSimulation
          });
        }
        EffectHelper.apply(battle, heroes, effect, char, isBeforeTurn);
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
          CharHelper.spendMana(char as IHero, manaDrainValue);
        }
        break;
      case '22-quicksands':
        if (isBeforeTurn) {
          this.charTakesDamage({
            battle,
            caster: CharHelper.getHeroById(effect.casterId, heroes),
            heroes,
            target: char,
            directDamage: 1,
            effectId: effect.id,
            isSimulation
          });
        }
        break;
      default:
        EffectHelper.apply(battle, heroes, effect, char, isBeforeTurn);
        break;
    }
  }

  checkRecalculateTriggers(battle: IBattle, heroes: IHero[], isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < heroes.length; i++) {
      // 11-duelist
      if (heroes[i].id === 'navarch' && CharHelper.getHeroAbilityById(heroes[i], '11-duelist')) {
        this.recalculateChar(battle, heroes, heroes[i], isBeforeTurn, isSimulation);
        if (BattleHelper.findEnemies(battle, heroes[i].id, 1, false, '', false, false).length === 1) {
          heroes[i].strength = heroes[i].strength + 2;
          heroes[i].armor = heroes[i].armor + 2;
        }
        // Проверяем симбиоз, чтобы перерасчитать его для Друида
        const symbiosisEffect = CharHelper.getCharEffectById(heroes[i], '43-symbiosis');
        if (symbiosisEffect) {
          this.recalculateChar(
            battle,
            heroes,
            CharHelper.getCharById(symbiosisEffect.casterId, heroes),
            isBeforeTurn,
            isSimulation
          );
        }
      }
    }
  }

  applyMapEffects(battle: IBattle, heroes: IHero[], isBeforeTurn: boolean, isSimulation: boolean) {
    this.checkRecalculateTriggers(battle, heroes, isBeforeTurn, isSimulation);

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
            const auraHero = CharHelper.getHeroById(effect.casterId, heroes);
            effect.position = {
              x: auraHero.position.x,
              y: auraHero.position.y
            };
            if (effect.casterId === 'lightbringer') {
              if (CharHelper.getCharEffectById(auraHero, '42-divine-radiance')) {
                effect.range = 3;
              } else {
                effect.range = 2;
              }
            }
            const alliesInRange = BattleHelper.findAllies(
              battle,
              effect.casterId,
              effect.range,
              true,
              true,
              true,
              false
            );

            const possibleChars: IChar[] = [];

            for (let j = 0; j < heroes.length; j++) {
              if (effect.id === '43-rallying' && heroes[j].id === 'paragon') {
                continue;
              }
              possibleChars.push(heroes[j]);
              possibleChars.push(...heroes[j].pets);
            }

            for (let j = 0; j < possibleChars.length; j++) {
              this.recalculateChar(battle, heroes, possibleChars[j], false, isSimulation);

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
              const vortexCaster = CharHelper.getHeroById(effect.casterId, heroes);
              const vortexPoints = MapHelper.findNearestPoints(effect.position, battle.scenario.tiles, effect.range);
              const vortexEnemies = BattleHelper.getPossibleEnemies(battle, effect.casterId);
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
              const fireCaster = CharHelper.getHeroById(effect.casterId, heroes);
              const fireBuff = CharHelper.getCharEffectById(fireCaster, effect.id);
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
              const firePoints = MapHelper.findNearestPoints(effect.position, battle.scenario.tiles, effect.range);
              const fireEnemies = BattleHelper.getPossibleEnemies(battle, effect.casterId);
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
            const sandStormCaster = CharHelper.getHeroById(effect.casterId, heroes);
            const sandStormPoints = MapHelper.findNearestPoints(effect.position, battle.scenario.tiles, effect.range);
            const sandStormEnemies = BattleHelper.getPossibleEnemies(battle, effect.casterId);

            const sandStormPossibleChars: IChar[] = [];

            for (let j = 0; j < heroes.length; j++) {
              sandStormPossibleChars.push(heroes[j]);
              sandStormPossibleChars.push(...heroes[j].pets);
            }

            // Reset states
            for (let j = 0; j < sandStormPossibleChars.length; j++) {
              this.recalculateChar(battle, heroes, sandStormPossibleChars[j], false, isSimulation);
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
                    directDamage: 1,
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
      if (!heroWithQuicksands && CharHelper.getCharEffectById(heroes[i], '22-quicksands')) {
        heroWithQuicksands = heroes[i];
      }

      if (!harmonyEffect) {
        harmonyEffect = CharHelper.getCharEffectById(heroes[i], '41-harmony');
        if (harmonyEffect) {
          heroWithHarmony = heroes[i];
        }
      }

      if (!symbiosisEffect) {
        symbiosisEffect = CharHelper.getCharEffectById(heroes[i], '43-symbiosis');
        if (symbiosisEffect) {
          heroWithSymbiosis = heroes[i];
        }
      }

      if (!sunAegisEffect) {
        sunAegisEffect = CharHelper.getCharEffectById(heroes[i], '32-sun-aegis');
        if (sunAegisEffect) {
          heroWithSunAegis = heroes[i];
        }
      }
    }

    if (heroWithQuicksands) {
      const allies = BattleHelper.findAllies(battle, heroWithQuicksands.id, 1, false, true, false, false);
      if (allies.length === 0) {
        heroWithQuicksands.isImmobilized = true;
      }
    }

    if (heroWithHarmony) {
      EffectHelper.apply(battle, heroes, harmonyEffect, heroWithHarmony, isBeforeTurn);
    }

    if (heroWithSymbiosis) {
      EffectHelper.apply(battle, heroes, symbiosisEffect, heroWithSymbiosis, isBeforeTurn);
    }

    for (let i = 0; i < heroes.length; i++) {
      CharHelper.normalizeCharStats(heroes[i]);
      for (let j = heroes[i].pets.length - 1; j >= 0; j--) {
        CharHelper.normalizeCharStats(heroes[i].pets[j]);
      }
    }

    if (isBeforeTurn && heroWithSunAegis && battle.queue[0] === heroWithSunAegis.id) {
      const sunAegisEnemies = BattleHelper.findEnemies(battle, heroWithSunAegis.id, 2, true, '', false, false);
      for (let i = 0; i < sunAegisEnemies.length; i++) {
        if (!heroWithSunAegis.isDead) {
          const enemyHero = CharHelper.getCharById(sunAegisEnemies[i], heroes);
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

  startBattle(battleSetup: IBattleSetupDto): IBattle {
    console.log(
      `Start battle, scenario: ${battleSetup.scenarioId}, setup: ${
        battleSetup.setupIndex > -1 ? battleSetup.setupIndex : 'manual'
      }`
    );
    let battle: IBattle;
    CharHelper.setRandomHeroes(battleSetup.teamSetup);
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
    battle.queue = BattleHelper.getQueue(battle.teams);
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
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

  moveChar(battle: IBattle, targetPosition: IPosition, isSimulation: boolean, petId?: string): IBattle {
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    let activeChar: IChar = activeHero;
    if (petId) {
      activeChar = activeHero.pets.find((p) => p.id === petId);
    }
    if (CharHelper.canMove(activeChar, !!petId)) {
      CharHelper.moveChar(activeChar, targetPosition, !!petId);
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
    // Удаляем невидимость, если Наварх сдвинулся с места
    if (movedChar.id === 'navarch' && CharHelper.getCharEffectById(movedChar, '22-smoke-cloud')) {
      for (let i = movedChar.effects.length - 1; i >= 0; i--) {
        if (movedChar.effects[i].id === '22-smoke-cloud') {
          movedChar.effects.splice(i, 1);
          this.recalculateChar(battle, heroes, movedChar, false, isSimulation);
          break;
        }
      }
    }

    this.applyMapEffects(battle, heroes, false, isSimulation);

    const crystalPositionIndex = battle.crystalPositions.findIndex((cp: IPosition) => {
      return cp.x === movedChar.position.x && cp.y === movedChar.position.y;
    });
    if (crystalPositionIndex > -1) {
      const movedCharTeam = CharHelper.getTeamByCharId(movedChar.id, battle.teams);
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
    MapHelper.knockBack(target, charPosition, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, target, isSimulation);
  }

  attraction(battle: IBattle, heroes: IHero[], target: IChar, charPosition: IPosition, isSimulation: boolean) {
    MapHelper.attraction(target, charPosition, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, target, isSimulation);
  }

  charge(battle: IBattle, heroes: IHero[], targetPosition: IPosition, char: IChar, isSimulation: boolean) {
    MapHelper.charge(targetPosition, char, battle.scenario.tiles, heroes);
    this.afterMoveChar(battle, heroes, char, isSimulation);
  }

  beforeTurn(battle: IBattle, heroes: IHero[], hero: IHero, isSimulation: boolean) {
    if (hero.isDead) {
      return;
    }

    for (let i = hero.effects.length - 1; i > -1; i--) {
      if (!hero.effects[i]) {
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

            const allies = BattleHelper.getPossibleAllies(battle, hero.effects[i].casterId, false);
            for (let j = 0; j < allies.length; j++) {
              this.recalculateChar(battle, heroes, allies[j], true, isSimulation);
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
      this.recalculateChar(battle, heroes, hero.pets[i], true, isSimulation);
    }

    this.recalculateChar(battle, heroes, hero, true, isSimulation);

    if (hero.isDead) {
      return; // check again because after DOT hero can die
    }

    if (CharHelper.getCharEffectById(hero, '33-time-trap')) {
      hero.energy = hero.maxEnergy / 2;
    } else {
      hero.energy = hero.maxEnergy;
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
  }

  endTurn(battle: IBattle, isSimulation: boolean): IBattle {
    battle.log.push({
      t: LogMessageType.TURN_END,
      id: battle.queue[0]
    });
    battle.queue.push(battle.queue.shift());
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    battle.log.push({
      t: LogMessageType.TURN_START,
      id: activeHero.id,
      x: activeHero.position.x, //initial position at the new turn beginning (for previousMoves)
      y: activeHero.position.y
    });

    this.beforeTurn(battle, heroes, activeHero, isSimulation);
    battle.scenario.beforeTurn(battle);
    if (
      battle.scenario.id === '2' ||
      battle.scenario.id === '3' ||
      battle.scenario.id === '4' ||
      battle.scenario.id === '5'
    ) {
      if (activeHero.crystals > Const.maxCrystalsBeforeOverload) {
        this.charTakesDamage({
          battle,
          caster: activeHero,
          heroes,
          target: activeHero,
          directDamage: activeHero.crystals - Const.maxCrystalsBeforeOverload,
          isOverload: true,
          isSimulation
        });
      }
    }

    if (battle.queue[0] && battle.queue.length > 1) {
      const newActiveHero = CharHelper.getHeroById(battle.queue[0], heroes);
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

  useWeapon(battle: IBattle, targetId: string, weaponId: string, isSimulation: boolean): IBattle {
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    const target = CharHelper.getCharById(targetId, heroes);
    let weapon: IEquip;

    if (activeHero.primaryWeapon.id === weaponId) {
      weapon = activeHero.primaryWeapon;
    } else if (activeHero.secondaryWeapon.id === weaponId) {
      weapon = activeHero.secondaryWeapon;
    } else {
      return battle;
    }

    if (!CharHelper.canUseWeapon(activeHero, weapon)) {
      return battle;
    }

    const { physDamage, magicDamage, directDamage } = BattleHelper.calculateWeaponDamage(weapon, activeHero);

    let energyCost = weapon.energyCost + activeHero.extraWeaponEnergyCost;
    if (energyCost < 0) {
      energyCost = 0;
    }

    activeHero.energy -= energyCost;
    if (!CharHelper.getCharEffectById(activeHero, '41-excellence')) {
      weapon.isUsed = true;
    }

    const healthDamage = this.charTakesDamage({
      battle,
      caster: activeHero,
      heroes,
      target,
      physDamage,
      magicDamage,
      directDamage,
      weaponId,
      isSimulation
    });

    this.checkPassiveAbilityTrigger(
      '22-counterattack',
      battle,
      activeHero,
      heroes,
      target,
      healthDamage,
      weaponId,
      isSimulation
    );

    this.checkPassiveAbilityTrigger(
      '23-enhanced-charges',
      battle,
      activeHero,
      heroes,
      target,
      healthDamage,
      weaponId,
      isSimulation
    );

    return battle;
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
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);

    CharHelper.upgradeEquip(battle, activeHero, equipId);
    this.applyCharEffects(battle, heroes, activeHero, false, isSimulation);
    this.applyMapEffects(battle, heroes, false, isSimulation);
    return battle;
  }

  learnAbility(battle: IBattle, abilityId: string, isSimulation: boolean): IBattle {
    let activeHero: IHero;
    const heroes = BattleHelper.getHeroesInBattle(battle);
    CharHelper.learnAbility(battle, heroes, abilityId);
    switch (abilityId) {
      case '13-lightning-rod':
      case '32-war-tree':
      case '12-reflection':
      case '21-flame-claws':
      case '11-duelist':
      case '23-enhanced-charges':
        activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
        this.recalculateChar(battle, heroes, activeHero, false, isSimulation);
        break;
      case '21-aura-of-might':
      case '22-aura-of-fortitude':
      case '23-aura-of-light':
        activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
        const auraEffect: IEffect = { ...EffectsData[abilityId] };

        auraEffect.left = auraEffect.duration;
        auraEffect.casterId = activeHero.id;
        battle.mapEffects.push(auraEffect);

        this.applyMapEffects(battle, heroes, false, isSimulation);
        break;
    }
    return battle;
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
    isOverload,
    isSimulation
  }: ICharTakesDamageArgs): number {
    let healthDamage = 0;

    if (!target || target.health < 1) {
      return 0;
    }

    if (CharHelper.getCharEffectById(target, '23-defender')) {
      target = CharHelper.getHeroById('paragon', heroes);
    }

    CharHelper.normalizeCharStats(caster);
    CharHelper.normalizeCharStats(target);

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
        : isOverload
        ? LogMessageType.OVERLOAD_DAMAGE
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

    if (target.health - healthDamage < 1) {
      healthDamage = target.health; // to avoid possible side effects after damage taken
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

    this.afterDamageTaken(battle, caster, heroes, target, healthDamage, weaponId, isSimulation);

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
    target: IChar | undefined,
    value: number,
    weaponId: string,
    isSimulation: boolean
  ) {
    this.checkPassiveAbilityTrigger('12-reflection', battle, caster, heroes, target, value, weaponId, isSimulation);

    // Удаляем Фортуну после получения урона
    if (target?.id === 'navarch' && value > 0 && CharHelper.getCharEffectById(target, '41-fortune')) {
      for (let i = target.effects.length - 1; i >= 0; i--) {
        if (target.effects[i].id === '41-fortune') {
          target.effects.splice(i, 1);
          this.recalculateChar(battle, heroes, target, false, isSimulation);
          break;
        }
      }
    }

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

  checkPassiveAbilityTrigger(
    passiveAbility: string,
    battle: IBattle,
    activeChar: IChar,
    heroes: IHero[],
    target: IChar,
    damageValue: number,
    weaponId: string,
    isSimulation: boolean
  ) {
    switch (passiveAbility) {
      case '22-counterattack':
        if (activeChar && activeChar.id !== 'paragon' && activeChar.health > 0) {
          const enemies = BattleHelper.findEnemies(battle, activeChar.id, 1, false, '22-counterattack', false, false);
          for (let i = 0; i < enemies.length; i++) {
            if (enemies[i] === 'paragon') {
              const paragon = CharHelper.getHeroById(enemies[i], heroes);
              if (!paragon.isDead && !paragon.isDisarmed && CharHelper.getHeroAbilityById(paragon, passiveAbility)) {
                this.charTakesDamage({
                  battle,
                  caster: paragon,
                  heroes,
                  target: activeChar,
                  abilityId: passiveAbility,
                  physDamage: paragon.primaryWeapon.physDamage + 1,
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
          CharHelper.getHeroAbilityById(target as IHero, '12-reflection')
        ) {
          CharHelper.takeMana(target as IHero, damageValue);
          battle.log.push({
            id: target.id,
            t: LogMessageType.TAKE_MANA,
            v: damageValue + ''
          });
          const enemies = BattleHelper.findEnemies(battle, target.id, 1, true, '12-reflection', true, false);
          for (let i = 0; i < enemies.length; i++) {
            const enemyChar = CharHelper.getCharById(enemies[i], heroes);
            if (enemyChar) {
              this.charTakesDamage({
                battle,
                caster: target,
                heroes,
                target: enemyChar,
                abilityId: passiveAbility,
                magicDamage: 1,
                isSimulation
              });
            }
          }
        }
        break;
      case '23-enhanced-charges': {
        if (
          activeChar.id === 'navarch' &&
          CharHelper.getHeroAbilityById(activeChar as IHero, '23-enhanced-charges') &&
          weaponId.startsWith('gun')
        ) {
          this.knockBack(battle, heroes, target, activeChar.position, isSimulation);
        }
        break;
      }
    }
  }

  // afterCastAbility(
  //   newBattle: IBattle,
  //   activeChar: IChar,
  //   heroes: IHero[],
  //   ability: IAbility,
  //   target: IChar,
  //   position: IPosition,
  //   isSimulation: boolean
  // ): IBattle {
  //   if (!ability.isPassive) {
  //     this.checkPassiveAbilityTrigger('22-counterattack', newBattle, activeChar, heroes, target, 0, isSimulation);
  //   }
  //   return newBattle;
  // }
}
