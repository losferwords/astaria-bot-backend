import { IAction } from '../IAction';

export interface ISimplifiedBotNode {
  action?: IAction;
  sims: number;
  wins: number;
  depth: number;
  children: [string, { action: IAction; node?: ISimplifiedBotNode }][];
}
