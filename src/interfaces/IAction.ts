import { ActionType } from '../enums/action-type.enum';
import { IPosition } from './IPosition';

export interface IAction {
  type: ActionType;
  casterId?: string;
  targetId?: string;
  weaponId?: string;
  value?: string;
  position?: IPosition;
}
