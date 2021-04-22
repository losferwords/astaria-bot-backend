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
      for (let j = 0; j < enemyHeroes[i].pets.length; j++) {
        possibleEnemies.push(enemyHeroes[i].pets[j]);
      }
    }
    return possibleEnemies;
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
    let battle: IBattle;
    this.heroService.setRandomHeroes(battleSetup.teamSetup);
    switch (battleSetup.scenarioId) {
      case '0':
        battle = {
          id: uuid(),
          scenario: new ChthonRuins(),
          teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
          queue: [],
          log: []
        };
        battle.scenario.setHeroPositions(battle.teams);
        battle.queue = this.getQueue(battle.teams);
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
      return this.heroService.moveHero(battle, activeHero, targetPosition);
    }
    return battle;
  }

  endTurn(battle: IBattle): IBattle {
    const newBattle = this.heroService.endTurn(battle);
    const heroes = this.getHeroesInBattle(newBattle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    activeHero.beforeTurn();
    return newBattle;
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
    const winner = newBattle.scenario.checkForWin(newBattle);
    if (winner) {
      this.battleEnd(newBattle, winner);
      if(!isSimulation) {
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

  getAvailableActions(battle: IBattle): IAction[] {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const actions: IAction[] = [];
    const moves = this.getMovePoints(battle);

    for (let i = 0; i < moves.length; i++) {
      actions.push({
        type: ActionType.MOVE,
        position: moves[i]
      });
    }

    if (this.heroService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range);
      for (let i = 0; i < enemies.length; i++) {
        actions.push({
          type: ActionType.WEAPON_DAMAGE,
          weaponId: activeHero.primaryWeapon.id,
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
          weaponId: activeHero.secondaryWeapon.id,
          casterId: activeHero.id,
          targetId: enemies[i]
        });
      }
    }
    actions.push({ type: ActionType.TURN_END });
    return actions;
  }
}
