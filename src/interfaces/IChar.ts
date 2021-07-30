import { IEffect } from './IEffect';
import { IPosition } from './IPosition';

export interface IChar {
  id: string;
  isPet: boolean;
  position: IPosition;

  maxHealth: number;
  health: number;
  regeneration: number;

  isStunned: boolean;
  isImmobilized: boolean;
  isSilenced: boolean;
  isDisarmed: boolean;
  isImmuneToDebuffs: boolean;

  effects: IEffect[];
}
