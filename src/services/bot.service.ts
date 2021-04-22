import * as _ from 'lodash';
import * as util from 'util';
import { Injectable } from '@nestjs/common';
import { BotNode } from 'src/models/BotNode';
import { Const } from 'src/static/const';
import { Helper } from 'src/static/helper';
import { ActionType } from '../enums/action-type.enum';
import { IAction } from '../interfaces/IAction';
import { IBattle } from '../interfaces/IBattle';
import { BattleService } from './battle.service';
import { ITeam } from 'src/interfaces/ITeam';
import { HeroService } from './hero.service';

@Injectable()
export class BotService {
  nodes: Map<string, BotNode>;

  constructor(private battleService: BattleService, private heroService: HeroService) {}

  private getStateHash(state: IBattle): string {
    return JSON.stringify(state.log);
  }

  private cloneState(state: IBattle): IBattle {
    return {
      id: state.id,
      scenario: state.scenario,
      teams: _.cloneDeep(state.teams),
      queue: [...state.queue],
      log: [...state.log]
    };
  }

  botAction(battleId: string): IBattle {
    const battle = this.battleService.getBattleById(battleId);
    const chosenAction = this.chooseAction(battle);
    return this.doAction(battle, chosenAction, false);
  }

  doAction(battle: IBattle, action: IAction, isSimulation: boolean): IBattle {
    switch (action.type) {
      case ActionType.MOVE:
        return this.battleService.moveHero(battle, action.position);
      case ActionType.WEAPON_DAMAGE:
        return this.battleService.useWeapon(battle, action.targetId, action.weaponId, isSimulation);
      case ActionType.TURN_END:
        return this.battleService.endTurn(battle);
    }
  }

  chooseAction(state: IBattle): IAction {
    const nodes = new Map<string, BotNode>();
    const stateHash = this.getStateHash(state);
    const unexpandedActions = this.battleService.getAvailableActions(state);
    if(unexpandedActions.length === 1) {
      return unexpandedActions[0];
    }
    const rootNode = new BotNode(null, null, state, unexpandedActions);
    nodes.set(stateHash, rootNode);
    const currentTeamId = this.heroService.getTeamIdByHeroId(state.queue[0], state.teams);

    let end = Date.now() + Const.botThinkTime;
    const simulationTime = [];

    while (Date.now() < end) {
      const startTime = Date.now();
      let node = this.select(nodes, state);
      let winner = node.state.scenario.checkForWin(node.state);

      if (node.isLeaf() === false && winner === null) {
        node = this.expand(nodes, node);
        winner = this.simulate(node);
      }
      this.backpropagate(node, winner, currentTeamId);
      simulationTime.push(Date.now() - startTime);
    }

    const stats = this.getStats(nodes, state);
    console.log(util.inspect(stats, { showHidden: false, depth: null }));
    let simulationTimeSum = 0;
    let simulationTimeMin = Infinity;
    let simulationTimeMax = 0;
    for(let i = 0; i < simulationTime.length; i++) {
      simulationTimeSum += simulationTime[i];
      if(simulationTime[i] < simulationTimeMin) {
        simulationTimeMin = simulationTime[i];
      }
      if(simulationTime[i] > simulationTimeMax) {
        simulationTimeMax = simulationTime[i];
      }
    }
    console.log('Average Simulation Time: ' + (simulationTimeSum / simulationTime.length).toFixed(0));
    console.log('Min Simulation Time: ' + simulationTimeMin.toFixed(0));
    console.log('Max Simulation Time: ' + simulationTimeMax.toFixed(0));

    return this.bestAction(nodes, state);
  }

  select(nodes: Map<string, BotNode>, state: IBattle): BotNode {
    let node = nodes.get(this.getStateHash(state));
    while (node.isFullyExpanded() && !node.isLeaf()) {
      const actions = node.allActions();
      let bestAction;
      let bestUCB1 = -Infinity;
      for (const action of actions) {
        const childUCB1 = node.childNode(action).getUCB1();
        if (childUCB1 > bestUCB1) {
          bestAction = action;
          bestUCB1 = childUCB1;
        }
      }
      node = node.childNode(bestAction);
    }
    return node;
  }

  expand(nodes: Map<string, BotNode>, node: BotNode): BotNode {
    const actions = node.unexpandedActions();
    const actionIndex = actions.length === 1 ? 0 : Helper.randomInt(0, actions.length - 1);
    const randomAction = actions[actionIndex];
    const newState = this.cloneState(node.state);
    this.doAction(newState, randomAction, true);

    const childUnexpandedActions = this.battleService.getAvailableActions(newState);
    const childNode = node.expand(randomAction, newState, childUnexpandedActions);
    nodes.set(this.getStateHash(newState), childNode);
    return childNode;
  }

  simulate(node: BotNode): ITeam {
    let state = node.state;
    let winner = state.scenario.checkForWin(state);

    while (winner === null) {
      const actions = this.battleService.getAvailableActions(state);
      const actionIndex = actions.length === 1 ? 0 : Helper.randomInt(0, actions.length - 1);
      const randomAction = actions[actionIndex];
      
      state = this.cloneState(state);
      this.doAction(state, randomAction, true);
      winner = state.scenario.checkForWin(state);
    }

    return winner;
  }

  backpropagate(node: BotNode, winner: ITeam, currentTeamId: string) {
    while (node !== null) {
      node.sims += 1;
      if (winner.id === currentTeamId) {
        node.wins += 1;
      }
      node = node.parent;
    }
  }

  getStats(nodes: Map<string, BotNode>, state: IBattle) {
    const node = nodes.get(this.getStateHash(state));
    const stats = {
      sims: node.sims,
      wins: node.wins,
      children: []
    };
    for (const child of node.children.values()) {
      if (child.node === null) {
        stats.children.push({ action: child.action, sims: null, wins: null });
      } else {
        stats.children.push({ action: child.action, sims: child.node.sims, wins: child.node.wins });
      }
    }
    return stats;
  }

  bestAction(nodes: Map<string, BotNode>, state: IBattle): IAction {
    const stateHash = this.getStateHash(state);
    if (!nodes.has(stateHash)) {
      const unexpandedActions = this.battleService.getAvailableActions(state);
      const rootNode = new BotNode(null, null, state, unexpandedActions);
      nodes.set(stateHash, rootNode);
    }

    // If not all children are expanded, not enough information
    if (nodes.get(stateHash).isFullyExpanded() === false) {
      throw new Error('Not enough information!');
    }

    const node = nodes.get(stateHash);
    const allActions = node.allActions();
    let bestAction;

    // Highest winrate (max child)
    let max = 0;
    for (const action of allActions) {
      const childNode = node.childNode(action);
      const ratio = childNode.wins / childNode.sims;
      if (ratio > max) {
        bestAction = action;
        max = ratio;
      }
    }

    console.log('Best Action: ', bestAction);

    return bestAction;
  }

  // chooseAction(battle: IBattle, actions: IAction[]): IAction {
  //   return actions[Helper.randomInt(0, actions.length - 1)];
  // }
}
