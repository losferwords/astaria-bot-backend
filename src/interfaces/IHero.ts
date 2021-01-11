import { IEquip } from './iEquip';
import { IHeroState } from './IHeroState';

export interface IHero {
    id: string;
    gender?: string;

    maxEnergy: number;
    maxHealth: number;
    maxMana: number;

    state?: IHeroState;
    primaryWeapons: IEquip[];
    secondaryWeapons?: IEquip[];
    chestpieces: IEquip[];
}
