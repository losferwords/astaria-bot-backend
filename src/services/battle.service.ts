import { IBattle } from "../interfaces/IBattle";
import { v1 as uuid } from "uuid";
import { ChthonRuins } from "../models/maps/chthon-ruins";
import { Team } from "../models/Team";

export class BattleService {

    constructor() {}

    async getScenarioTeamSize(id: string): Promise<number[]> {
        return new Promise<number[]>((resolve) => {
            switch(id) {
                case "1": resolve([2, 2]);
            }
        });
    }

    startBattle(id: string, heroes: any[]) {
        return new Promise<IBattle>((resolve) => {
            let battle: IBattle;
            switch(id) {
                case "1":
                    battle = {
                        id: uuid(),
                        map: new ChthonRuins(),
                        teams: [new Team(heroes[0]), new Team(heroes[1])]
                    };
                    break;
            }
            resolve(battle);
        });
    }
}