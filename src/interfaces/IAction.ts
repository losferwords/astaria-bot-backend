import { ActionType } from '../enums/action-type.enum';
import { IPosition } from './IPosition';

export interface IAction {
    type: ActionType;
    id?: string;
    casterId?: string;
    targetId?: string;
    value?: string;
    position?: IPosition;
}
