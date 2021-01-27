export interface IEquip {
    id: string;
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
    isPassive: boolean;
    isUsed: boolean;
}
