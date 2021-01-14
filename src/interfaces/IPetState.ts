import { IAbility } from './IAbility';
import { IEffect } from './iEffect';
import { IPosition } from './IPosition';

export interface IPetState {
    buffs: IEffect[];
    debuffs: IEffect[];
    ability: IAbility;

    health: number;

    isStunned: boolean;
    isImmobilized: boolean;

    position: IPosition;
}
