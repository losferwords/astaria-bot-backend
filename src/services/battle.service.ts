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

  getMovePoints(battle: IBattle): IPosition[] {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    let movePoints: IPosition[] = [];
    if (this.heroService.canMove(activeHero)) {
      movePoints = this.mapService.getMovePoints(activeHero.position, 1, battle.scenario.tiles, heroes);
    }
    return movePoints;
  }

  moveHero(battle: IBattle, targetPosition: IPosition): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    if (this.heroService.canMove(activeHero)) {
      this.heroService.moveHero(battle, activeHero, targetPosition);
      const crystalPositionIndex = battle.crystalPositions.findIndex((cp: IPosition) => {
        return cp.x === targetPosition.x && cp.y === targetPosition.y;
      });
      if (crystalPositionIndex > -1) {
        const activeTeam = this.heroService.getTeamByHeroId(activeHero.id, battle.teams);
        activeTeam.crystals += 1;
        battle.log.push({
          type: LogMessageType.TAKE_CRYSTAL,
          id: activeHero.id
        });
        battle.crystalPositions.splice(crystalPositionIndex, 1);
      }
    }
    return battle;
  }

  knockBack(battle: IBattle, target: IHero, heroPosition: IPosition) {
    const heroes = this.getHeroesInBattle(battle);
    this.mapService.knockBack(target, heroPosition, battle.scenario.tiles, heroes);
  }

  applyEffect(
    battle: IBattle,
    heroes: IHero[],
    hero: IHero,
    effect: IEffect,
    isBeforeTurn: boolean,
    isSimulation: boolean
  ) {
    switch (effect.id) {
      case '12-poison-touch':
        if (isBeforeTurn) {
          battle.log.push({
            type: LogMessageType.EFFECT_DAMAGE,
            casterId: effect.casterId,
            targetId: hero.id,
            abilityId: effect.id,
            value: '1'
          });
          this.heroTakesDamage(battle, this.heroService.getHeroById(effect.casterId, heroes), hero, 1, isSimulation);
        }
        break;
      default:
        this.effectService.apply(effect, hero, isBeforeTurn);
        break;
    }
  }

  applyHeroEffects(battle: IBattle, heroes: IHero[], hero: IHero, isBeforeTurn: boolean, isSimulation: boolean) {
    for (let i = 0; i < hero.effects.length; i++) {
      if (hero.effects[i].left > 0) {
        this.applyEffect(battle, heroes, hero, hero.effects[i], isBeforeTurn, isSimulation);
      }
    }
  }

  beforeTurn(battle: IBattle, heroes: IHero[], hero: IHero, isSimulation) {
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

  findEnemies(battle: IBattle, sourceHeroId: string, radius: number): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceHero = this.heroService.getHeroById(sourceHeroId, heroes);
    const points = this.mapService.findNearestPoints(sourceHero.position, battle.scenario.tiles, radius);
    const possibleEnemies = this.getPossibleEnemies(battle, sourceHeroId);

    const enemies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleEnemies.length; j++) {
        if (
          points[i].x === possibleEnemies[j].position.x &&
          points[i].y === possibleEnemies[j].position.y &&
          !(possibleEnemies[j] as IHero).isDead &&
          !this.mapService.rayTrace(
            { x: sourceHero.position.x, y: sourceHero.position.y },
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
    const target = this.heroService.getHeroById(targetId, heroes);
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

    const totalDamage = this.calculateWeaponDamage(weapon, activeHero, target);

    battle.log.push({
      type: LogMessageType.WEAPON_DAMAGE,
      casterId: activeHero.id,
      targetId: target.id,
      equipId: weapon.id,
      value: totalDamage + ''
    });

    activeHero.energy -= weapon.energyCost;
    weapon.isUsed = true;
    this.heroTakesDamage(battle, activeHero, target, totalDamage, isSimulation);

    return battle;
  }

  afterCastAbility(newBattle: IBattle, isSimulation: boolean): IBattle {
    const winner = newBattle.scenario.checkForWin(newBattle.teams);
    if (winner) {
      this.battleEnd(newBattle, winner);
      if (!isSimulation) {
        this.removeBattle(newBattle.id);
        this.reportService.saveBattleResults(newBattle);
        this.reportService.addToStatistics(newBattle, winner);
      }
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

  checkAbilityForUse(ability: IAbility, hero: IHero): boolean {
    if (ability.targetType === AbilityTargetType.MOVE && hero.isImmobilized) {
      return false;
    }
    if (ability.needWeapon && hero.isDisarmed) {
      return false;
    }
    if (ability.isSpell && hero.isSilenced) {
      return false;
    }
    if (ability.left === 0 && hero.energy - ability.energyCost >= 0 && hero.mana - ability.manaCost >= 0) {
      switch (ability.id) {
        case '13-dangerous-knowledge':
          return hero.intellect > 0;
        default:
          return true;
      }
    } else {
      return false;
    }
  }

  heroTakesDamage(battle: IBattle, caster: IHero, target: IHero, value: number, isSimulation): boolean {
    if (value === 0) {
      return false;
    }
    target.health -= value;

    this.afterDamageTaken(battle, caster, target, value, isSimulation);

    if (target.health <= 0) {
      this.heroService.heroDeath(battle, target);
    }

    return true;
  }

  afterDamageTaken(battle: IBattle, caster: IHero, target: IHero, value: number, isSimulation: boolean) {
    if (target.id === 'oracle' && this.heroService.getHeroAbilityById(target, '12-reflection')) {
      this.heroService.takeMana(target, value);
      battle.log.push({
        id: target.id,
        type: LogMessageType.TAKE_MANA,
        value: value + ''
      });
      const enemies = this.findEnemies(battle, target.id, 1);
      const heroes = this.getHeroesInBattle(battle);
      for (let i = 0; i < enemies.length; i++) {
        const enemyHero = this.heroService.getHeroById(enemies[i], heroes);
        const magicDamage = value + target.intellect - enemyHero.will;
        battle.log.push({
          type: LogMessageType.ABILITY_DAMAGE,
          casterId: target.id,
          targetId: enemyHero.id,
          abilityId: '12-reflection',
          value: magicDamage + ''
        });
        this.heroTakesDamage(battle, target, enemyHero, magicDamage, isSimulation);
      }
    }

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

  calculateWeaponDamage(weapon: IEquip, activeHero: IHero, target: IHero) {
    let physDamage = weapon.physDamage + activeHero.strength - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }

    let weaponMagicDamage = weapon.magicDamage;

    if (activeHero.id === 'highlander' && this.heroService.getHeroAbilityById(activeHero, '13-lightning-rod')) {
      weaponMagicDamage = 2;
    }

    let magicDamage = weaponMagicDamage + activeHero.intellect - target.will;
    if (magicDamage < 0) {
      magicDamage = 0;
    }

    return physDamage + magicDamage;
  }

  getAvailableActions(battle: IBattle, previousMoves: IPosition[]): IAction[] {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const team = this.heroService.getTeamByHeroId(activeHero.id, battle.teams);
    const actions: IAction[] = [];

    if (team.crystals > 0 || activeHero.crystals > 0) {
      const heroData = this.heroService.getHeroData(activeHero.id);
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
            for (let i = 0; i < enemies.length; i++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: enemies[i]
              });
            }
            break;
          case AbilityTargetType.ALLY:
            const allies = this.findAllies(battle, activeHero.id, ability.range, true);
            for (let i = 0; i < allies.length; i++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: allies[i]
              });
            }
            break;
          case AbilityTargetType.ALLY_NOT_ME:
            const alliesWithoutMe = this.findAllies(battle, activeHero.id, ability.range, false);
            for (let i = 0; i < alliesWithoutMe.length; i++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: alliesWithoutMe[i]
              });
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY:
            const allHeroes = this.findHeroes(battle, activeHero.id, ability.range);
            for (let i = 0; i < allHeroes.length; i++) {
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                targetId: allHeroes[i]
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
            for (let i = 0; i < movePoints.length; i++) {
              if (
                previousMoves.length &&
                previousMoves.find((move) => move.x === movePoints[i].x && move.y === movePoints[i].y)
              ) {
                continue;
              }
              actions.push({
                type: ActionType.ABILITY,
                abilityId: ability.id,
                casterId: activeHero.id,
                position: movePoints[i]
              });
            }
            break;
          case AbilityTargetType.MAP:
            console.log('NOT IMPLEMENTED');
            break;
        }
      }
    }

    if (this.heroService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        if (
          this.calculateWeaponDamage(
            activeHero.primaryWeapon,
            activeHero,
            this.heroService.getHeroById(enemies[i], heroes)
          ) > 0
        ) {
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
        if (
          this.calculateWeaponDamage(
            activeHero.secondaryWeapon,
            activeHero,
            this.heroService.getHeroById(enemies[i], heroes)
          ) > 0
        ) {
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
