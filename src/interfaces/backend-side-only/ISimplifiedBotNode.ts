import { IAction } from '../IAction';

export interface ISimplifiedBotNode {
  action?: IAction;
  sims: number;
  wins: number;
  depth: number;
}
