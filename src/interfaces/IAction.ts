import { ActionType } from '../enums/action-type.enum';

export interface IAction {
  type: ActionType;
  casterId?: string;
  targetId?: string;
  equipId?: string;
  abilityId?: string;
  value?: string;
  positionX?: number;
  positionY?: number;
}
