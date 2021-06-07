import { ActionType } from '../enums/action-type.enum';
import { IPosition } from './IPosition';

export interface IAction {
  type: ActionType;
  casterId?: string;
  targetId?: string;
  equipId?: string;
  abilityId?: string;
  value?: string;
  position?: IPosition;
}
