import { Const } from '../static/const';
import { ITeam } from '../interfaces/ITeam';
import { v1 as uuid } from 'uuid';
import { IHero } from '../interfaces/IHero';
import { Hero } from './Hero';
import { ITeamSetup } from '../interfaces/ITeamSetup';

export class Team implements ITeam {
    id: string;
    crystals: number;
    heroes: IHero[] = [];

    constructor(teamSetup: ITeamSetup[]) {
        this.id = uuid();
        this.crystals = 0;

        for (let i = 0; i < teamSetup.length; i++) {
            this.heroes.push(new Hero(teamSetup[i]));
        }
    }
}
