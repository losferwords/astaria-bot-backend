import { IEquip } from './IEquip';

export interface IHeroData {
  id: string;

  maxEnergy: number;
  maxHealth: number;
  maxMana: number;

  primaryWeapons: IEquip[];
  secondaryWeapons?: IEquip[];
  chestpieces: IEquip[];
}
