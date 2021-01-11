import { IHero } from "./IHero";

export interface ITeam {
    id: string;
    heroes: IHero[];
    crystals: number;
}
