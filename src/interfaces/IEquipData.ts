import { IEquip } from './IEquip';

export interface IEquipData {
  primaryWeapons: IEquip[];
  secondaryWeapons?: IEquip[];
  chestpieces: IEquip[];
}
