import { IBotNode } from 'src/interfaces/backend-side-only/IBotNode';
import { IBotTreeBranch } from 'src/interfaces/backend-side-only/IBotTreeBranch';
import { IAction } from 'src/interfaces/IAction';
import { IBattle } from 'src/interfaces/IBattle';
import { Const } from 'src/static/const';

export class BotNode implements IBotNode {
  state: IBattle;
  action: IAction;
  sims: number = 0;
  wins: number = 0;
  depth: number = 0;
  children: Map<string, IBotTreeBranch>;
  parent: BotNode;

  constructor(parent: BotNode, action: IAction, state: IBattle, unexpandedActions: IAction[]) {
    this.action = action;
    this.state = state;

    this.parent = parent;
    this.depth = this.parent ? this.parent.depth + 1 : 0;
    this.children = new Map();
    for(let i = 0; i < unexpandedActions.length; i++) {
      this.children.set(this.getActionHash(unexpandedActions[i]), { action: unexpandedActions[i], node: null });
    }
  }

  getActionHash(action: IAction): string {
    return JSON.stringify(action);
  }

  getUCB1(): number {
    return this.wins / this.sims + Math.sqrt((Const.explorationParameter * Math.log(this.parent.sims)) / this.sims);
  }

  isLeaf(): boolean {
    return this.children.size === 0;
  }

  isFullyExpanded(): boolean {
    for (let child of this.children.values()) {
      if (child.node === null) {
        return false;
      }
    }
    return true;
  }

  allActions(): IAction[] {
    const actions = [];
    for (let child of this.children.values()) {
      actions.push(child.action);
    }
    return actions;
  }

  childNode(action: IAction): BotNode {
    const child = this.children.get(this.getActionHash(action));
    if (child === undefined) {
      throw new Error('No child action!');
    } 
    // else if (child.node === null) {
    //   throw new Error('Child node is not expanded!');
    // }
    return child.node;
  }

  unexpandedActions(): IAction[] {
    const actions = [];
    for (const child of this.children.values()) {
      if (child.node === null) {
        actions.push(child.action);
      }
    }
    return actions;
  }

  expand(action: IAction, childState: IBattle, unexpandedActions: IAction[]): BotNode {
    const actionHash = this.getActionHash(action);
    if (!this.children.has(actionHash)) {
      throw new Error('No child action!');
    }
    const childNode = new BotNode(this, action, childState, unexpandedActions);
    this.children.set(actionHash, { action: action, node: childNode });
    return childNode;
  }
}
