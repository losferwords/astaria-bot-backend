import * as util from 'util';
import * as rfdc from 'rfdc';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { BotNode } from 'src/models/BotNode';
import { Const } from 'src/static/const';
import { ActionType } from '../enums/action-type.enum';
import { IAction } from '../interfaces/IAction';
import { IBattle } from '../interfaces/IBattle';
import { BattleService } from './battle.service';
import { ITeam } from 'src/interfaces/ITeam';
import { HeroService } from './hero.service';
import { IPosition } from 'src/interfaces/IPosition';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { ReportService } from './report.service';
import { AbilityService } from './ability.service';
import { IHero } from 'src/interfaces/IHero';
import { IAbility } from 'src/interfaces/IAbility';
import { IChar } from 'src/interfaces/IChar';

@Injectable()
export class BotService {
  nodes: Map<string, BotNode>;

  constructor(
    private battleService: BattleService,
    private heroService: HeroService,
    private reportService: ReportService,
    private abilityService: AbilityService
  ) {}
  private actionChain = [];

  private getStateHash(state: IBattle): string {
    return JSON.stringify(state.log);
  }

  private cloneState(state: IBattle): IBattle {
    const newTeams: ITeam[] = new Array(state.teams.length);
    for (let i = 0; i < state.teams.length; i++) {
      newTeams[i] = {
        id: state.teams[i].id,
        crystals: state.teams[i].crystals,
        heroes: new Array(state.teams[i].heroes.length)
      };
      for (let j = 0; j < state.teams[i].heroes.length; j++) {
        newTeams[i].heroes[j] = rfdc({ proto: true })(state.teams[i].heroes[j]);
      }
    }
    return {
      id: state.id,
      scenario: state.scenario,
      crystalPositions: state.crystalPositions.slice(0),
      teams: newTeams,
      queue: state.queue.slice(0),
      log: state.log.slice(0)
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
      case ActionType.PET_MOVE:
        // action.casterId means that this is a PET_MOVE
        return this.battleService.moveChar(battle, action.position, action.casterId ? action.casterId : undefined);
      case ActionType.WEAPON_DAMAGE:
        return this.battleService.useWeapon(battle, action.targetId, action.equipId, isSimulation);
      case ActionType.ABILITY:
      case ActionType.PET_ABILITY:
        const heroes = this.battleService.getHeroesInBattle(battle);
        const activeHero: IHero = this.heroService.getHeroById(battle.queue[0], heroes);
        let activeChar: IChar = activeHero;
        const target: IChar =
          activeChar.id === action.targetId ? activeChar : this.heroService.getCharById(action.targetId, heroes);
        let ability: IAbility = this.heroService.getHeroAbilityById(activeHero, action.abilityId);

        //Maybe it is a pet ability
        if (!ability) {
          for (let i = 0; i < activeHero.pets.length; i++) {
            if (activeHero.pets[i].ability.id === action.abilityId) {
              ability = activeHero.pets[i].ability;
              activeChar = activeHero.pets[i];
            }
          }
        }

        const newBattle = this.abilityService.castAbility(
          battle,
          heroes,
          ability,
          activeChar,
          target,
          action.position,
          isSimulation
        );
        return this.battleService.afterCastAbility(
          newBattle,
          activeChar,
          heroes,
          ability,
          target,
          action.position,
          isSimulation
        );
      case ActionType.UPGRADE_EQUIP:
        return this.battleService.upgradeEquip(battle, action.equipId);
      case ActionType.LEARN_ABILITY:
        return this.battleService.learnAbility(battle, action.abilityId);
      case ActionType.TURN_END:
        return this.battleService.endTurn(battle, isSimulation);
    }
  }

  chooseAction(state: IBattle): IAction {
    if (this.actionChain.length > 0) {
      const actionFromChain = this.actionChain[0];
      this.actionChain.shift();
      return actionFromChain;
    }
    const nodes = new Map<string, BotNode>();

    // Clone state and clean log to avoid long state chain copies
    state = this.cloneState(state);
    const heroes = this.battleService.getHeroesInBattle(state);
    const activeHero = this.heroService.getHeroById(state.queue[0], heroes);
    state.log = [
      {
        type: LogMessageType.TURN_START,
        id: activeHero.id,
        position: activeHero.position
      }
    ];

    const stateHash = this.getStateHash(state);
    const unexpandedActions = this.battleService.getAvailableActions(state, []);
    if (unexpandedActions.length === 1) {
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
      let winner = node.state.scenario.checkForWin(node.state.teams);

      if (node.isLeaf() === false && winner === null) {
        node = this.expand(nodes, node);
        winner = this.simulate(node, currentTeamId);
      }
      this.backpropagate(node, winner, currentTeamId);
      simulationTime.push(Date.now() - startTime);
    }

    const stats = this.getStats(nodes, state);
    console.log(util.inspect(stats, { showHidden: false, depth: null }));
    let simulationTimeSum = 0;
    let simulationTimeMin = Infinity;
    let simulationTimeMax = 0;
    for (let i = 0; i < simulationTime.length; i++) {
      simulationTimeSum += simulationTime[i];
      if (simulationTime[i] < simulationTimeMin) {
        simulationTimeMin = simulationTime[i];
      }
      if (simulationTime[i] > simulationTimeMax) {
        simulationTimeMax = simulationTime[i];
      }
    }
    console.log('Average Simulation Time: ' + (simulationTimeSum / simulationTime.length).toFixed(0));
    console.log('Min Simulation Time: ' + simulationTimeMin.toFixed(0));
    console.log('Max Simulation Time: ' + simulationTimeMax.toFixed(0));

    // Create mcts diagram
    if (Const.treeBuild) {
      this.reportService.saveTreeVisualization(rootNode);
    }

    this.actionChain = this.bestActionChain(nodes, state);
    const actionFromChain = this.actionChain[0];
    this.actionChain.shift();
    return actionFromChain;
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
    //const actionIndex = actions.length === 1 ? 0 : Helper.randomInt(0, actions.length - 1);
    const randomAction = actions[0];
    const newState = this.cloneState(node.state);
    this.doAction(newState, randomAction, true);

    const previousMoves = this.getPreviousMoves(newState);
    const childUnexpandedActions = this.battleService.getAvailableActions(newState, previousMoves);
    const childNode = node.expand(randomAction, newState, childUnexpandedActions);
    nodes.set(this.getStateHash(newState), childNode);
    return childNode;
  }

  simulate(node: BotNode, currentTeamId: string): ITeam {
    let state = node.state;
    let winner = state.scenario.checkForWin(state.teams);
    let chainLength = 0;
    let startTime = new Date();

    while (winner === null) {
      chainLength += 1;
      const previousMoves = this.getPreviousMoves(state);
      const actions = this.battleService.getAvailableActions(state, previousMoves);
      //const actionIndex = actions.length === 1 ? 0 : Helper.randomInt(0, actions.length - 1);
      const randomAction = actions[0];

      state = this.cloneState(state);
      this.doAction(state, randomAction, true);
      winner = state.scenario.checkForWin(state.teams);

      //If actionChain is too long, let's assume, that this is a lose
      if(winner) {
        console.log(
          'chainLength: ' +
            chainLength +
            ', logLength: ' +
            state.log.length +
            ', time: ' +
            (+new Date() - +startTime) +
            'ms'
        );
      }
      if (chainLength >= Const.maxChainLength) {
        console.log(
          'chainLength: ' +
            chainLength +
            ', logLength: ' +
            state.log.length +
            ', time: ' +
            (+new Date() - +startTime) +
            'ms <- MAX'
        );
        winner = state.teams.find((team: ITeam) => {
          return team.id !== currentTeamId;
        });
      }      
    }
    if (winner.id === currentTeamId) {
      node.shortestWin = chainLength + node.depth;
    }

    return winner;
  }

  backpropagate(node: BotNode, winner: ITeam, currentTeamId: string) {
    let winNum = winner.id === currentTeamId ? 1 : 0;
    while (node !== null) {
      node.sims += 1;
      node.wins += winNum;
      if (winNum === 1 && node.parent && node.parent.shortestWin > node.shortestWin) {
        node.parent.shortestWin = node.shortestWin;
      }
      node = node.parent;
    }
  }

  getPreviousMoves(state: IBattle): IPosition[] {
    const previousMoves: IPosition[] = [];
    const activeHeroId = state.log[state.log.length - 1].id
      ? state.log[state.log.length - 1].id
      : state.log[state.log.length - 1].casterId;

    for (let i = state.log.length - 2; i > -1; i--) {
      if (state.log[i].type === LogMessageType.TURN_START) {
        previousMoves.push(state.log[i].position);
        break;
      }
      if (state.log[i].id === activeHeroId) {
        if (state.log[i].type === LogMessageType.MOVE) {
          previousMoves.push(state.log[i].position);
        }
      } else {
        break;
      }
    }
    return previousMoves;
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
        stats.children.push({ action: child.action, sims: null, wins: null, shortestWin: null });
      } else {
        stats.children.push({
          action: child.action,
          sims: child.node.sims,
          wins: child.node.wins,
          shortestWin: child.node.shortestWin
        });
      }
    }
    return stats;
  }

  bestNode(nodes: Map<string, BotNode>, state: IBattle): BotNode {
    const stateHash = this.getStateHash(state);
    if (!nodes.has(stateHash)) {
      throw new Error('No such state in nodes list!');
    }

    const node = nodes.get(stateHash);
    const allActions = node.allActions();
    let bestNode = null;

    //Highest winrate
    // let maxWinRatio = 0;
    // for (const action of allActions) {
    //   const childNode = node.childNode(action);
    //   const winRatio = childNode.wins / childNode.sims;
    //   if (winRatio > maxWinRatio) {
    //     bestNode = childNode;
    //     maxWinRatio = winRatio;
    //   }
    // }

    // Highest sims
    // let maxSims = 0;
    // for (const action of allActions) {
    //   const childNode = node.childNode(action);
    //   if (childNode && childNode.sims > maxSims) {
    //     bestNode = childNode;
    //     maxSims = childNode.sims;
    //   }
    // }

    // Highest sims and shortest win
    let minSims = Infinity;
    let maxSims = 0;
    let longestWin = 0;
    let shortestWin = Infinity;
    for (const action of allActions) {
      const childNode = node.childNode(action);
      if (childNode) {
        if (childNode.sims > maxSims) {
          maxSims = childNode.sims;
        }
        if (childNode.sims < minSims) {
          minSims = childNode.sims;
        }
        if (childNode.shortestWin > longestWin) {
          longestWin = childNode.shortestWin;
        }
        if (childNode.shortestWin < shortestWin) {
          shortestWin = childNode.shortestWin;
        }
      }
    }

    const nodesQualities: { node: BotNode; quality: number }[] = [];

    const simsDiff = maxSims - minSims;
    const shortestWinDiff = longestWin - shortestWin;

    for (const action of allActions) {
      const childNode = node.childNode(action);
      if (childNode) {
        const simsMod = simsDiff > 0 ? (childNode.sims - minSims) / simsDiff : 1;
        const shortestWinMod = shortestWinDiff > 0 ? 1 - (childNode.shortestWin - shortestWin) / shortestWinDiff : 1;
        nodesQualities.push({
          node: childNode,
          quality: simsMod * shortestWinMod
        });
      }
    }

    if (nodesQualities.length) {
      const maxQualityObj = _.maxBy(nodesQualities, 'quality');
      if (maxQualityObj) {
        bestNode = maxQualityObj.node;
      } else {
        console.log('no maxQualityObj');
      }
    }

    if (!bestNode) {
      console.log('No best nodes for state depth: ' + JSON.parse(stateHash).length);
    }

    return bestNode;
  }

  bestActionChain(nodes: Map<string, BotNode>, state: IBattle): IAction[] {
    let bestNode = this.bestNode(nodes, state);
    if (!bestNode) {
      return [];
    }
    const actionChain = [bestNode.action];
    while (bestNode && bestNode.action.type !== ActionType.TURN_END) {
      bestNode = this.bestNode(nodes, bestNode.state);
      if (bestNode) {
        actionChain.push(bestNode.action);
      }
    }
    return actionChain;
  }
}
