import { IEquipState } from './IEquipState';

export interface IEquip {
    name: string;
    level: number;
    strength: number;
    intellect: number;
    armor: number;
    will: number;
    regeneration: number;
    mind: number;
    range?: number;
    cost?: number;
    energyCost?: number;
    physDamage?: number;
    magicDamage?: number;
    state?: IEquipState;
}
