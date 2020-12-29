import { Const } from "../static/const";
import { ITeam } from "../interfaces/ITeam";
import { v1 as uuid } from "uuid";
import { IHero } from "../interfaces/IHero";
import { Hero } from "./Hero";

export class Team implements ITeam {
    id: string;
    crystals: number;
    heroes: IHero[];

    constructor(heroIds: string[]) {
        this.id = uuid();
        this.crystals = 0;

        for(let i = 0; i < heroIds.length; i++) {
            this.heroes.push(new Hero(heroIds[i]));
        }
    }
}