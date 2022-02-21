import { BotNode } from 'src/models/BotNode';
import { IAction } from '../IAction';

export interface IBotTreeBranch {
  action: IAction;
  node?: BotNode;
}
