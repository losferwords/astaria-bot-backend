import { IAbility } from './IAbility';
import { IChar } from './IChar';
import { IEffect } from './IEffect';

export interface IPet extends IChar {
  maxHealth: number;

  effects: IEffect[];
  ability: IAbility;

  health: number;

  isStunned: boolean;
  isImmobilized: boolean;
}
