import { IAbility } from './IAbility';
import { IEffect } from './iEffect';
import { IEquip } from './iEquip';
import { IPosition } from './IPosition';

export interface IHeroState {
    buffs: IEffect[];
    debuffs: IEffect[];
    abilities: IAbility[];
    primaryWeapon?: IEquip;
    secondaryWeapon?: IEquip;
    chestpiece?: IEquip;

    strength: number;
    intellect: number;
    armor: number;
    will: number;
    regeneration: number;
    mind: number;

    energy: number;
    health: number;
    mana: number;

    isDead: boolean;
    isInvisible: boolean;
    isSilenced: boolean;
    isDisarmed: boolean;
    isStunned: boolean;
    isImmobilized: boolean;

    moveEnergyCost: number;
    position: IPosition;
    crystals: number;
}
