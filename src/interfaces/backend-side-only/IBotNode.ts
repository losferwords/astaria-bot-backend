import { BotNode } from 'src/models/BotNode';
import { IAction } from '../IAction';
import { IBattle } from '../IBattle';
import { IBotTreeBranch } from './IBotTreeBranch';

export interface IBotNode {
  state?: IBattle;
  action?: IAction;
  sims: number;
  wins: number;
  children: Map<string, IBotTreeBranch>;
  parent?: BotNode;
  getActionHash: (action: IAction) => string;
  getUCB1: () => number;
  isLeaf: () => boolean;
  isFullyExpanded: () => boolean;
  allActions: () => IAction[];
  childNode: (action: IAction) => BotNode;
  unexpandedActions: () => IAction[];
  expand: (action: IAction, childState: IBattle, unexpandedActions: IAction[]) => BotNode;
}
