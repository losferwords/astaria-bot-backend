import { ITeam } from '../interfaces/ITeam';
import { v1 as uuid } from 'uuid';
import { IHero } from '../interfaces/IHero';
import { Hero } from './Hero';
import { IHeroSetup } from '../interfaces/IHeroSetup';
import { Const } from 'src/static/const';

export class Team implements ITeam {
  id: string;
  crystals: number;
  heroes: IHero[] = [];

  constructor(teamSetup: IHeroSetup[]) {
    this.id = uuid();
    this.crystals = Const.startCrystals;

    for (let i = 0; i < teamSetup.length; i++) {
      this.heroes.push(new Hero(teamSetup[i]));
    }
  }
}
