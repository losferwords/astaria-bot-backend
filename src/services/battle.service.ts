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

@Injectable()
export class BattleService {
  battles: IBattle[] = [];

  constructor(private mapService: MapService, private heroService: HeroService, private reportService: ReportService) {}

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

  endTurn(battle: IBattle): IBattle {
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
    activeHero.beforeTurn();
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

  useWeapon(battle: IBattle, targetId: string, weaponId: string, isSimulation: boolean): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    const newBattle = this.heroService.useWeapon(battle, heroes, targetId, weaponId);
    const winner = newBattle.scenario.checkForWin(newBattle.teams);
    if (winner) {
      this.battleEnd(newBattle, winner);
      if (!isSimulation) {
        this.removeBattle(battle.id);
        this.reportService.saveBattleResults(battle);
        this.reportService.addToStatistics(battle, winner);
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

    if (this.heroService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        actions.push({
          type: ActionType.WEAPON_DAMAGE,
          equipId: activeHero.primaryWeapon.id,
          casterId: activeHero.id,
          targetId: enemies[i]
        });
      }
    }
    if (activeHero.secondaryWeapon && this.heroService.canUseWeapon(activeHero, activeHero.secondaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.secondaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        actions.push({
          type: ActionType.WEAPON_DAMAGE,
          equipId: activeHero.secondaryWeapon.id,
          casterId: activeHero.id,
          targetId: enemies[i]
        });
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

  upgradeEquip(battle: IBattle, equipId: string): IBattle {
    const heroes = this.getHeroesInBattle(battle);
    return this.heroService.upgradeEquip(battle, heroes, equipId);
  }
}
