import { IBattle } from '../interfaces/IBattle';
import { v1 as uuid } from 'uuid';
import { ChthonRuins } from '../models/maps/chthon-ruins';
import { Team } from '../models/Team';
import { IBattleSetup } from '../interfaces/IBattleSetup';
import { Const } from '../static/const';
import { Helper } from '../static/helper';

export class BattleService {

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
                        teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])]
                    };
                    this.setHeroPositions(battle);
                    break;
            }
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
}
