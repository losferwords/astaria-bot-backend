import { IAbility } from './IAbility';
import { IChar } from './IChar';

export interface IPet extends IChar {
  isMoved: boolean;
  ability: IAbility;
}
