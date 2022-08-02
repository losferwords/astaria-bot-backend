import { IAction } from 'src/interfaces/IAction';
import { IBattle } from 'src/interfaces/IBattle';

export interface IStartSimulationDto {
  unexpandedActions: IAction[];
  state: IBattle;
}
