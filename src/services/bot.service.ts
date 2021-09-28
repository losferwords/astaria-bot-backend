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
import { Helper } from 'src/static/helper';
import { IEffect } from 'src/interfaces/IEffect';
import { IPet } from 'src/interfaces/IPet';
import { IEquip } from 'src/interfaces/IEquip';

@Injectable()
export class BotService {
  nodes: Map<string, BotNode>;

  constructor(
    private battleService: BattleService,
    private heroService: HeroService,
    private reportService: ReportService,
    private abilityService: AbilityService
  ) {}
  private actionChain: IAction[] = [];

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
          effects: effects,
          abilities: abilities,
          pets: pets,
          primaryWeapon: primaryWeapon,
          chestpiece: chestpiece,

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
    for (let i = 0; i < mapEffects.length; i++) {
      mapEffects.push(Object.assign({}, mapEffects[i]));
    }

    return {
      id: state.id,
      scenario: state.scenario,
      crystalPositions: crystalPositions,
      mapEffects: mapEffects,
      teams: newTeams,
      queue: state.queue.slice(0),
      log: state.log.slice(0)
    };
  }

  botAction(battleId: string): IBattle {
    const battle = this.battleService.battle;
    const chosenAction = this.chooseAction(battle);
    return this.doAction(battle, chosenAction, false);
  }

  doAction(battle: IBattle, action: IAction, isSimulation: boolean): IBattle {
    if (!action) {
      return battle;
    }
    switch (action.type) {
      case ActionType.MOVE:
      case ActionType.PET_MOVE:
        // action.casterId means that this is a PET_MOVE
        return this.battleService.moveChar(
          battle,
          { x: action.positionX, y: action.positionY },
          isSimulation,
          action.casterId ? action.casterId : undefined
        );
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
          action.positionX === undefined ? undefined : { x: action.positionX, y: action.positionY },
          isSimulation
        );
        return this.battleService.afterCastAbility(
          newBattle,
          activeChar,
          heroes,
          ability,
          target,
          action.positionX === undefined ? undefined : { x: action.positionX, y: action.positionY },
          isSimulation
        );
      case ActionType.UPGRADE_EQUIP:
        return this.battleService.upgradeEquip(battle, action.equipId, isSimulation);
      case ActionType.LEARN_ABILITY:
        return this.battleService.learnAbility(battle, action.abilityId, isSimulation);
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
        positionX: activeHero.position.x,
        positionY: activeHero.position.y
      }
    ];

    const stateHash = this.getStateHash(state);
    const unexpandedActions = this.battleService.getAvailableActions(state, []);
    if (unexpandedActions.length === 1) {
      return unexpandedActions[0];
    }
    const rootNode = new BotNode(null, null, state, unexpandedActions);
    nodes.set(stateHash, rootNode);
    const currentTeamId = this.heroService.getTeamByHeroId(state.queue[0], state.teams).id;

    let end = Date.now() + Const.botThinkTime;
    const simulationTime: number[] = [];

    while (Date.now() < end) {
      const startTime = Date.now();
      let node = this.select(nodes, state);
      let winner = node.state.scenario.checkForWin(node.state.teams);

      if (node.isLeaf() === false && winner === null && node.state.queue.length > 0) {
        node = this.expand(nodes, node);
        winner = this.simulate(node, currentTeamId);
      }
      this.backpropagate(node, winner, currentTeamId);
      simulationTime.push(Date.now() - startTime);
    }

    const stats = this.getStats(nodes, state);
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
    console.log('----------------------------------------');
    if (Const.simulationInfo) {
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
      for (let i = 0; i < stats.children.length; i++) {
        let actionStr = 'Action ' + i + '\tsims: ' + stats.children[i].sims + '\twins: ' + stats.children[i].wins;
        for (const key in stats.children[i].action) {
          if (key === 'positionX') {
            actionStr +=
              '\tposition: (' + stats.children[i].action.positionX + ',' + stats.children[i].action.positionY + ')';
          } else if (key !== 'positionY') {
            actionStr += '\t' + key + ': ' + JSON.stringify(stats.children[i].action[key]);
          }
        }
        console.log(actionStr);
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

      //If actionChain is too long, let's assume, that this is a lose
      if (chainLength >= Const.maxChainLength) {
        if (Const.maxChainInfo) {
          console.log('chainLength: ' + chainLength + ', logLength: ' + state.log.length + ' <- MAX');
        }
        winner = state.teams.find((team: ITeam) => {
          return team.id !== currentTeamId;
        });
      }
    }

    return winner;
  }

  backpropagate(node: BotNode, winner: ITeam, currentTeamId: string) {
    let winNum = winner.id === currentTeamId ? 1 : 0;
    while (node !== null) {
      node.sims += 1;
      node.wins += winNum;
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
        previousMoves.push({ x: state.log[i].positionX, y: state.log[i].positionY });
        break;
      }
      if (state.log[i].id === activeHeroId) {
        if (state.log[i].type === LogMessageType.MOVE) {
          previousMoves.push({ x: state.log[i].positionX, y: state.log[i].positionY });
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
        stats.children.push({ action: child.action, sims: null, wins: null });
      } else {
        stats.children.push({
          action: child.action,
          sims: child.node.sims,
          wins: child.node.wins
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
    let maxSims = 0;
    for (const action of allActions) {
      const childNode = node.childNode(action);
      if (childNode && childNode.sims > maxSims) {
        bestNode = childNode;
        maxSims = childNode.sims;
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
