import { IBattle } from '../interfaces/IBattle';
import { v1 as uuid } from 'uuid';
import { ChthonRuins } from '../models/maps/chthon-ruins';
import { Team } from '../models/Team';
import { IBattleSetup } from '../interfaces/IBattleSetup';
import { Const } from '../static/const';
import { Helper } from '../static/helper';
import { ITeam } from '../interfaces/ITeam';
import _ from 'lodash';
import { Hero } from '../models/Hero';
import { IHero } from '../interfaces/IHero';
import { IPosition } from '../interfaces/IPosition';
import { TileType } from '../enums/tile-type.enum';

export class BattleService {
    battles: IBattle[] = [];

    constructor() {}

    async getScenarioTeamSize(id: string): Promise<number[]> {
        return new Promise<number[]>((resolve) => {
            switch (id) {
                case '1': resolve([2, 2]);
            }
        });
    }

    startBattle(battleSetup: IBattleSetup) {
        return new Promise<IBattle>((resolve) => {
            let battle: IBattle;
            switch (battleSetup.scenarioId) {
                case '1':
                    this.setRandomHeroes(battleSetup.teamSetup);
                    battle = {
                        id: uuid(),
                        map: new ChthonRuins(),
                        teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
                        queue: []
                    };
                    this.setHeroPositions(battle);
                    battle.queue = this.getQueue(battle.teams);
                    break;
            }
            this.battles.push(battle);
            resolve(battle);
        });
    }

    private setRandomHeroes(teamSetup) {
        const availableHeroes = [...Const.moveOrder];
        const randomHeroes = [];
        for (let i = 0; i < teamSetup.length; i++) {
            for (let j = 0; j < teamSetup[i].length; j++) {
                const heroName = teamSetup[i][j].hero;
                if (heroName === 'random') {
                    randomHeroes.push(teamSetup[i][j]);
                } else {
                    availableHeroes.splice(availableHeroes.indexOf(heroName), 1);
                }
            }
        }
        while (randomHeroes.length > 0) {
            const randomHeroIndex = Helper.randomInt(0, availableHeroes.length - 1);
            randomHeroes[0].hero = availableHeroes[randomHeroIndex];
            availableHeroes.splice(randomHeroIndex, 1);
            randomHeroes.splice(0, 1);
        }
    }

    private setHeroPositions(battle: IBattle) {
        for (let i = 0; i < battle.teams.length; i++) {
            for (let j = 0; j < battle.teams[i].heroes.length; j++) {
                battle.teams[i].heroes[j].state.position.x = battle.map.teamPositions[i][j].x;
                battle.teams[i].heroes[j].state.position.y = battle.map.teamPositions[i][j].y;
            }
        }
    }

    private getQueue(teams: ITeam[]): string[] {
        const heroes = [];
        for (let i = 0; i < teams.length; i++){
            for (let j = 0; j < teams[i].heroes.length; j++) {
                heroes.push(teams[i].heroes[j].id);
            }
        }
        return _.intersection(Const.moveOrder, heroes);
    }

    private getHeroesInBattle(battle: IBattle): IHero[] {
        const heroes = [];
        for (let i = 0; i < battle.teams.length; i++){
            for (let j = 0; j < battle.teams[i].heroes.length; j++) {
                heroes.push(battle.teams[i].heroes[j]);
            }
        }
        return heroes;
    }

    private getBattleById(id: string): IBattle {
        return this.battles.find((battle: IBattle) => {
            return battle.id === id;
        });
    }

    private getActiveHero(battle: IBattle): IHero {
        const heroes = this.getHeroesInBattle(battle);
        return heroes.find((hero: IHero) => {
            return hero.id === battle.queue[0];
        });
    }

    private findNearestPoints(position: IPosition, radius: number): IPosition[] {
        const points = [];
        for (let i = -radius; i <= radius; i++) {
            if (position.x + i >= 0) {
                for (let j = -radius; j <= radius; j++) {
                    if (position.y + j >= 0){
                        points.push({x: position.x + i, y: position.y + j});
                    }
                }
            }
        }
        return points;
    }

    checkTileForObstacle(position: IPosition, battle: IBattle): boolean {
        const heroes = this.getHeroesInBattle(battle);
        for (let i = 0; i < heroes.length; i++){
            for (let j = 0; j < heroes[i].state.pets.length; j++) {
                if (heroes[i].state.pets[j].state.position.x === position.x &&
                    heroes[i].state.pets[j].state.position.y === position.y)
                {
                    return true;
                }
            }
            if (heroes[i].state.position.x === position.x &&
                heroes[i].state.position.y === position.y &&
                !heroes[i].state.isDead &&
                battle.map.tiles[position.x][position.y] &&
                battle.map.tiles[position.x][position.y].type === TileType.FLOOR)
            {
                return true;
            }
        }
        return false;
    }

    getMovePoints(battleId: string, radius: number = 1): IPosition[] {
        const battle = this.getBattleById(battleId);
        const activeHero = this.getActiveHero(battle);
        const points = this.findNearestPoints(activeHero.state.position, radius);

        const availablePoints = [];
        for (let i = 0; i < points.length; i++){
            if (!this.checkTileForObstacle(points[i], battle)){
                availablePoints.push(points[i]);
            }
        }
        return availablePoints;
    }
}
