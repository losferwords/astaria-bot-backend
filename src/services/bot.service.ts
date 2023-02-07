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
import { Helper } from 'src/static/helper';
import { IEffect } from 'src/interfaces/IEffect';
import { IPet } from 'src/interfaces/IPet';
import { IEquip } from 'src/interfaces/IEquip';
import { ISimulationResult } from 'src/interfaces/backend-side-only/ISimulationResult';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ISimplifiedBotNode } from 'src/interfaces/backend-side-only/ISimplifiedBotNode';

interface Statistic {
  sims: number;
  wins: number;
  children: Statistic[];
  action?: IAction;
}

@Injectable()
export class BotService {
  nodes: Map<string, BotNode>;
  private actionChain: IAction[] = [];

  constructor(
    private battleService: BattleService,
    private heroService: HeroService,
    private reportService: ReportService,
    private abilityService: AbilityService,
    private readonly httpService: HttpService
  ) {}

  async botAction(): Promise<IBattle> {
    const battle = this.battleService.battle;
    const chosenAction = await this.chooseAction(battle);
    return this.doAction(battle, chosenAction, false);
  }

  doAction(battle: IBattle, action: IAction, isSimulation: boolean): IBattle {
    if (!action) {
      return battle;
    }
    switch (action.t) {
      case ActionType.MOVE:
      case ActionType.PET_MOVE:
        // action.casterId means that this is a PET_MOVE
        return this.battleService.moveChar(
          battle,
          { x: action.x, y: action.y },
          isSimulation,
          action.c ? action.c : undefined
        );
      case ActionType.WEAPON_DAMAGE:
        return this.battleService.useWeapon(battle, action.tr, action.e, isSimulation);
      case ActionType.ABILITY:
      case ActionType.PET_ABILITY:
        const heroes = this.battleService.getHeroesInBattle(battle);
        const activeHero: IHero = this.heroService.getHeroById(battle.queue[0], heroes);
        let activeChar: IChar = activeHero;
        const target: IChar =
          activeChar.id === action.tr ? activeChar : this.heroService.getCharById(action.tr, heroes);
        let ability: IAbility = this.heroService.getHeroAbilityById(activeHero, action.a);

        // Maybe it is a pet ability
        if (!ability) {
          for (let i = 0; i < activeHero.pets.length; i++) {
            if (activeHero.pets[i].ability.id === action.a) {
              ability = activeHero.pets[i].ability;
              activeChar = activeHero.pets[i];
            }
          }
        }

        this.abilityService.castAbility(
          battle,
          heroes,
          ability,
          activeChar,
          target,
          action.x === undefined ? undefined : { x: action.x, y: action.y },
          isSimulation
        );
        // return this.battleService.afterCastAbility(
        //   newBattle,
        //   activeChar,
        //   heroes,
        //   ability,
        //   target,
        //   action.x === undefined ? undefined : { x: action.x, y: action.y },
        //   isSimulation
        // );
        return battle;
      case ActionType.UPGRADE_EQUIP:
        return this.battleService.upgradeEquip(battle, action.e, isSimulation);
      case ActionType.LEARN_ABILITY:
        return this.battleService.learnAbility(battle, action.a, isSimulation);
      case ActionType.TURN_END:
        return this.battleService.endTurn(battle, isSimulation);
    }
  }

  async chooseAction(state: IBattle): Promise<IAction> {
    if (this.actionChain.length > 0) {
      const firstActionFromChain = this.actionChain[0];
      this.actionChain.shift();
      return firstActionFromChain;
    }

    const unexpandedActions = this.battleService.getAvailableActions(state, []);
    if (unexpandedActions.length === 1) {
      return unexpandedActions[0];
    }
    const rootNode = new BotNode(null, null, state, unexpandedActions);

    // Clone state and clean log to avoid long state chain copies
    state = this.cloneState(state);

    const simulations: Promise<AxiosResponse<ISimulationResult> | ISimulationResult>[] = [
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.startSimulation(rootNode, state, false));
        }, 1000);
      })
    ];

    for (let i = 1; i < Const.numberOfServers; i++) {
      simulations.push(
        lastValueFrom(
          this.httpService.post(`http://localhost:300${i + 1}/start-simulation`, {
            startSimulationData: {
              unexpandedActions,
              state
            }
          })
        )
      );
    }

    const results = await Promise.all(simulations);

    const { nodes, simulationTime } = results[0] as ISimulationResult;

    console.log('----------------------------------------');

    for (const result of results) {
      if ((result as AxiosResponse<ISimulationResult>).data) {
        const externalResult = (result as AxiosResponse<ISimulationResult>).data;
        const externalNodes = new Map<string, BotNode>(externalResult.nodes);
        let intersectedNodesCount = 0;
        for (const node of nodes) {
          const stateHash = this.getStateHash(node[1].state);
          const duplicatedNode = externalNodes.get(stateHash);
          if (duplicatedNode && node[1].depth === duplicatedNode.depth) {
            node[1].sims += duplicatedNode.sims;
            node[1].wins += duplicatedNode.wins;
            intersectedNodesCount++;
          }
        }
        if (Const.simulationInfo) {
          console.log(
            `Internal nodes: ${nodes.size}, External nodes: ${externalNodes.size}, Intersection: ${(
              (intersectedNodesCount / nodes.size) *
              100
            ).toFixed(0)}%`
          );

          for (let i = 0; i < externalResult.simulationTime.length; i++) {
            simulationTime.push(externalResult.simulationTime[i]);
          }
        }
      }
    }

    if (Const.simulationInfo) {
      const stats = this.getStats(nodes, state);

      console.log('Sims: ' + stats.sims + ', Wins: ' + stats.wins);

      stats.children = stats.children.sort((a, b) => {
        if (a.sims > b.sims) {
          return -1;
        } else if (a.sims < b.sims) {
          return 1;
        } else {
          return 0;
        }
      });

      console.log('Chances: ' + ((stats.children[0].wins / stats.children[0].sims) * 100).toFixed(2) + '%');

      for (let i = 0; i < stats.children.length; i++) {
        let actionStr = 'Action ' + i + '\tsims: ' + stats.children[i].sims + '\twins: ' + stats.children[i].wins;
        for (const key in stats.children[i].action) {
          if (key === 'x') {
            actionStr += '\tposition: (' + stats.children[i].action.x + ',' + stats.children[i].action.y + ')';
          } else if (key !== 'y') {
            actionStr += '\t' + key + ': ' + JSON.stringify(stats.children[i].action[key]);
          }
        }
        console.log(actionStr);
      }

      if (Const.simulationTimeInfo) {
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
        console.log(
          'Simulation Time: Avg: ' +
            (simulationTimeSum / simulationTime.length).toFixed(0) +
            ', Min: ' +
            simulationTimeMin.toFixed(0) +
            ', Max: ' +
            simulationTimeMax.toFixed(0)
        );
      }
    }

    // Create mcts diagram
    if (Const.treeBuild) {
      this.reportService.saveTreeVisualization(rootNode);
    }

    this.actionChain = this.bestActionChain(nodes, state);
    const actionFromChain = this.actionChain[0];
    this.actionChain.shift();

    if (global.gc) {
      global.gc();
    }

    if (Const.memoryInfo) {
      this.showMemoryUsage();
    }
    return actionFromChain;
  }

  showMemoryUsage() {
    const used = process.memoryUsage();
    console.log(
      'Memory: rss: ' +
        Math.round((used.rss / 1024 / 1024) * 100) / 100 +
        ' MB, heapTotal: ' +
        Math.round((used.heapTotal / 1024 / 1024) * 100) / 100 +
        ' MB, heapUsed: ' +
        Math.round((used.heapUsed / 1024 / 1024) * 100) / 100 +
        ' MB'
    );
  }

  startSimulation(rootNode: BotNode, state: IBattle, isExternalServer: boolean): ISimulationResult {
    const nodes = new Map<string, BotNode>();

    if (!isExternalServer) {
      const heroes = this.battleService.getHeroesInBattle(state);
      const activeHero = this.heroService.getHeroById(state.queue[0], heroes);
      state.log = [
        {
          t: LogMessageType.TURN_START,
          id: activeHero.id,
          x: activeHero.position.x,
          y: activeHero.position.y
        }
      ];
    }

    const stateHash = this.getStateHash(state);

    nodes.set(stateHash, rootNode);
    const currentTeamId = this.heroService.getTeamByHeroId(state.queue[0], state.teams).id;

    const end = Date.now() + Const.botThinkTime;
    const simulationTime: number[] = [];
    let startTime = Date.now();

    while (
      Date.now() < end &&
      !this.checkObviousAction(rootNode) &&
      !(isExternalServer && nodes.size >= Const.maxNumberOfNodesForExternalServer) &&
      !(nodes.size >= Const.maxNumberOfNodesForInternalServer)
    ) {
      try {
        if (Const.simulationTimeInfo) {
          startTime = Date.now();
        }
        let node = this.select(nodes, state, currentTeamId);
        let winner = node.state.scenario.checkForWin(node.state.teams);

        if (node.isLeaf() === false && winner === null && node.state.queue.length > 0) {
          node = this.expand(nodes, node);
          winner = this.simulate(node, currentTeamId);
        }
        this.backpropagate(node, winner, currentTeamId);

        if (Const.simulationTimeInfo) {
          simulationTime.push(Date.now() - startTime);
        }
      } catch (e) {
        console.log(e);
        this.showMemoryUsage();
        break;
      }
    }

    return {
      nodes,
      simulationTime
    };
  }

  simplifySimulationResults(nodes: Map<string, BotNode>): [string, ISimplifiedBotNode][] {
    return Array.from(nodes).map((node) => {
      return [node[0], this.simplifyBotNode(node[1])];
    });
  }

  simplifyBotNode(node: BotNode): ISimplifiedBotNode {
    return {
      sims: node.sims,
      wins: node.wins,
      depth: node.depth
    };
  }

  select(nodes: Map<string, BotNode>, state: IBattle, currentTeamId: string): BotNode {
    let node = nodes.get(this.getStateHash(state));
    while (node.isFullyExpanded() && !node.isLeaf()) {
      const actions = node.allActions();
      let bestAction: IAction;
      let bestUCB1 = -Infinity;
      const isAllyTurn = this.heroService.getTeamByHeroId(node.state.queue[0], node.state.teams).id === currentTeamId;
      // For ally moves we select action by UCB1 algorithm
      // For enemy we just pick random action to check to avoid too optimistic decisions
      if (isAllyTurn) {
        for (const action of actions) {
          const childUCB1 = node.childNode(action).getUCB1();
          if (childUCB1 > bestUCB1) {
            bestAction = action;
            bestUCB1 = childUCB1;
          }
        }
      } else {
        bestAction = actions[Math.floor(Math.random() * actions.length)];
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

    while (winner === null) {
      chainLength += 1;
      const previousMoves = this.getPreviousMoves(state);
      const actions = this.battleService.getAvailableActions(state, previousMoves);
      const actionIndex = actions.length === 1 ? 0 : Helper.randomInt(0, actions.length - 1);
      const randomAction = actions[actionIndex];

      state = this.cloneState(state);
      this.doAction(state, randomAction, true);
      winner = state.scenario.checkForWin(state.teams);

      // If actionChain is too long, let's assume, that this is a lose
      if (chainLength >= Const.maxChainLength) {
        if (Const.maxChainInfo) {
          console.log('chainLength: ' + chainLength + ', logLength: ' + state.log.length + ' <- MAX');
        }
        winner = state.teams.find((team: ITeam) => team.id !== currentTeamId);
      }
    }

    return winner;
  }

  backpropagate(node: BotNode, winner: ITeam, currentTeamId: string) {
    const winNum = winner.id === currentTeamId ? 1 : 0;
    while (node !== null) {
      node.sims += 1;
      node.wins += winNum;
      node = node.parent;
    }
  }

  checkObviousAction(rootNode: BotNode): boolean {
    if (rootNode.sims < Const.obviousMoveMinSims) {
      return false;
    }

    const bestAction = [...rootNode.children].sort((a, b) => {
      if (a[1].node?.sims > b[1].node?.sims) {
        return -1;
      } else if (a[1].node?.sims < b[1].node?.sims) {
        return 1;
      } else {
        return 0;
      }
    })[0][1];

    if (
      bestAction.node?.sims >= Const.obviousMoveMinSims &&
      bestAction.node?.wins / bestAction.node?.sims >= Const.obviousMoveRatio
    ) {
      if (Const.obviousMoveInfo) {
        console.log('----------------------------------------');
        console.log(
          `${rootNode.state.queue[0]} found obvious win, sims: ${bestAction.node?.sims}, wins: ${bestAction.node?.wins}`
        );
      }
      return true;
    }

    // if (
    //   bestAction.node?.sims >= Const.obviousMoveMinSims &&
    //   bestAction.node?.wins / bestAction.node?.sims < 1 - Const.obviousMoveRatio
    // ) {
    //   if (Const.obviousMoveInfo) {
    //     console.log('----------------------------------------');
    //     console.log(
    //       `${rootNode.state.queue[0]} found obvious lose, sims: ${bestAction.node?.sims}, wins: ${bestAction.node?.wins}`
    //     );
    //   }
    //   return true;
    // }

    return false;
  }

  getPreviousMoves(state: IBattle): IPosition[] {
    const previousMoves: IPosition[] = [];
    const activeHeroId = state.log[state.log.length - 1].id
      ? state.log[state.log.length - 1].id
      : state.log[state.log.length - 1].c;

    for (let i = state.log.length - 2; i > -1; i--) {
      if (state.log[i].t === LogMessageType.TURN_START) {
        previousMoves.push({ x: state.log[i].x, y: state.log[i].y });
        break;
      }
      if (state.log[i].id === activeHeroId) {
        if (state.log[i].t === LogMessageType.MOVE) {
          previousMoves.push({ x: state.log[i].x, y: state.log[i].y });
        }
      } else {
        break;
      }
    }
    return previousMoves;
  }

  getStats(nodes: Map<string, BotNode>, state: IBattle): Statistic {
    const node = nodes.get(this.getStateHash(state));
    let totalSims = 0;
    let totalWins = 0;
    const stats = {
      sims: 0,
      wins: 0,
      children: []
    };
    for (const child of node.children.values()) {
      if (child.node === null) {
        stats.children.push({ action: child.action, sims: null, wins: null });
      } else {
        stats.children.push({
          action: child.action,
          sims: child.node.sims,
          wins: child.node.wins
        });
        totalSims += child.node.sims;
        totalWins += child.node.wins;
      }
    }
    stats.sims = totalSims;
    stats.wins = totalWins;
    return stats;
  }

  bestNode(nodes: Map<string, BotNode>, state: IBattle): BotNode {
    const stateHash = this.getStateHash(state);
    if (!nodes.has(stateHash)) {
      throw new Error('No such state in nodes list!');
    }

    const node = nodes.get(stateHash);
    const allActions = node.allActions();
    let bestNode: BotNode = null;

    // Highest winrate
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
    let maxSims = 0;
    let minSims = 10000000;

    const heroes = this.battleService.getHeroesInBattle(state);
    const activeHero = this.heroService.getHeroById(state.queue[0], heroes);

    for (const action of allActions) {
      const childNode = node.childNode(action);
      if (activeHero.effects.find((e) => e.id === '33-mind-control')) {
        if (childNode && childNode.sims < minSims) {
          bestNode = childNode;
          minSims = childNode.sims;
        }
      } else {
        if (childNode && childNode.sims > maxSims) {
          bestNode = childNode;
          maxSims = childNode.sims;
        }
      }
    }

    if (!bestNode && Const.bestNodesInfo) {
      console.log('No best nodes for state depth: ' + JSON.parse(stateHash).length.toString());
    }

    return bestNode;
  }

  bestActionChain(nodes: Map<string, BotNode>, state: IBattle): IAction[] {
    let bestNode = this.bestNode(nodes, state);
    if (!bestNode) {
      return [];
    }
    const actionChain = [bestNode.action];
    while (
      bestNode &&
      bestNode.action.t !== ActionType.TURN_END &&
      !bestNode.state.log.find((l) => l.t === LogMessageType.WIN)
    ) {
      bestNode = this.bestNode(nodes, bestNode.state);
      if (bestNode) {
        actionChain.push(bestNode.action);
      }
    }
    return actionChain;
  }

  private getStateHash(state: IBattle): string {
    return JSON.stringify(state.log);
  }

  private cloneState(state: IBattle): IBattle {
    const newTeams: ITeam[] = [];
    for (let i = 0; i < state.teams.length; i++) {
      const newHeroes: IHero[] = [];
      for (let j = 0; j < state.teams[i].heroes.length; j++) {
        const effects: IEffect[] = [];
        for (let k = 0; k < state.teams[i].heroes[j].effects.length; k++) {
          effects.push(Object.assign({}, state.teams[i].heroes[j].effects[k]));
        }

        const abilities: IAbility[] = [];
        for (let k = 0; k < state.teams[i].heroes[j].abilities.length; k++) {
          abilities.push(Object.assign({}, state.teams[i].heroes[j].abilities[k]));
        }

        const pets: IPet[] = [];
        for (let k = 0; k < state.teams[i].heroes[j].pets.length; k++) {
          const petEffects: IEffect[] = [];
          for (let l = 0; l < state.teams[i].heroes[j].pets[k].effects.length; l++) {
            petEffects.push(Object.assign({}, state.teams[i].heroes[j].pets[k].effects[l]));
          }

          pets.push({
            id: state.teams[i].heroes[j].pets[k].id,
            isPet: true,
            maxHealth: state.teams[i].heroes[j].pets[k].maxHealth,
            effects: petEffects,
            ability: Object.assign({}, state.teams[i].heroes[j].pets[k].ability),

            health: state.teams[i].heroes[j].pets[k].health,
            regeneration: state.teams[i].heroes[j].pets[k].regeneration,

            isStunned: state.teams[i].heroes[j].pets[k].isStunned,
            isImmobilized: state.teams[i].heroes[j].pets[k].isImmobilized,
            isDisarmed: state.teams[i].heroes[j].pets[k].isDisarmed,
            isSilenced: state.teams[i].heroes[j].pets[k].isSilenced,
            isBlind: state.teams[i].heroes[j].pets[k].isBlind,
            isMoved: state.teams[i].heroes[j].pets[k].isMoved,
            isImmuneToDisarm: state.teams[i].heroes[j].pets[k].isImmuneToDisarm,
            isImmuneToDebuffs: state.teams[i].heroes[j].pets[k].isImmuneToDebuffs,

            position: { x: state.teams[i].heroes[j].pets[k].position.x, y: state.teams[i].heroes[j].pets[k].position.y }
          });
        }

        const primaryWeapon: IEquip = Object.assign({}, state.teams[i].heroes[j].primaryWeapon);
        const chestpiece: IEquip = Object.assign({}, state.teams[i].heroes[j].chestpiece);

        const newHero: IHero = {
          id: state.teams[i].heroes[j].id,
          isPet: false,
          maxEnergy: state.teams[i].heroes[j].maxEnergy,
          maxHealth: state.teams[i].heroes[j].maxHealth,
          maxMana: state.teams[i].heroes[j].maxMana,
          effects,
          abilities,
          pets,
          primaryWeapon,
          chestpiece,

          strength: state.teams[i].heroes[j].strength,
          intellect: state.teams[i].heroes[j].intellect,
          armor: state.teams[i].heroes[j].armor,
          will: state.teams[i].heroes[j].will,
          regeneration: state.teams[i].heroes[j].regeneration,
          mind: state.teams[i].heroes[j].mind,

          energy: state.teams[i].heroes[j].energy,
          health: state.teams[i].heroes[j].health,
          mana: state.teams[i].heroes[j].mana,

          isDead: state.teams[i].heroes[j].isDead,
          isInvisible: state.teams[i].heroes[j].isInvisible,
          isSilenced: state.teams[i].heroes[j].isSilenced,
          isDisarmed: state.teams[i].heroes[j].isDisarmed,
          isStunned: state.teams[i].heroes[j].isStunned,
          isImmobilized: state.teams[i].heroes[j].isImmobilized,
          isBlind: state.teams[i].heroes[j].isBlind,
          isImmuneToDisarm: state.teams[i].heroes[j].isImmuneToDisarm,
          isImmuneToDebuffs: state.teams[i].heroes[j].isImmuneToDebuffs,
          maxAllowedAbilityLevel: state.teams[i].heroes[j].maxAllowedAbilityLevel,

          moveEnergyCost: state.teams[i].heroes[j].moveEnergyCost,
          extraWeaponEnergyCost: state.teams[i].heroes[j].extraWeaponEnergyCost,
          position: { x: state.teams[i].heroes[j].position.x, y: state.teams[i].heroes[j].position.y },
          crystals: state.teams[i].heroes[j].crystals
        };

        if (state.teams[i].heroes[j].secondaryWeapon) {
          newHero.secondaryWeapon = Object.assign({}, state.teams[i].heroes[j].secondaryWeapon);
        }

        newHeroes.push(newHero);
      }

      newTeams.push({
        id: state.teams[i].id,
        crystals: state.teams[i].crystals,
        heroes: newHeroes
      });
    }

    const crystalPositions: IPosition[] = [];
    for (let i = 0; i < state.crystalPositions.length; i++) {
      crystalPositions.push({
        x: state.crystalPositions[i].x,
        y: state.crystalPositions[i].y
      });
    }

    const mapEffects: IEffect[] = [];
    for (let i = 0; i < state.mapEffects.length; i++) {
      mapEffects.push(Object.assign({}, state.mapEffects[i]));
    }

    return {
      id: state.id,
      scenario: state.scenario,
      crystalPositions,
      mapEffects,
      teams: newTeams,
      queue: state.queue.slice(0),
      log: state.log.slice(0)
    };
  }
}
