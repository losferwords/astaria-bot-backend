import { IPosition } from './IPosition';

export interface IEffect {
  id: string;
  duration: number;
  left?: number;
  casterId?: string;
  isBuff: boolean;
  isRemovable: boolean;
  position?: IPosition;
  range?: number;
}
