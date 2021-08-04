import { Injectable } from '@nestjs/common';
import { IBattle } from '../interfaces/IBattle';
import { LogMessageType } from '../enums/log-message-type.enum';
import * as fs from 'fs';
import { Const } from '../static/const';
import { ITeam } from '../interfaces/ITeam';
import { ILogMessage } from '../interfaces/ILogMessage';
import { BotNode } from 'src/models/BotNode';
import { ActionType } from 'src/enums/action-type.enum';
import { IAction } from 'src/interfaces/IAction';

@Injectable()
export class ReportService {
  constructor() {}

  totalNodes: number = 0;
  unexpandedNodes: number = 0;

  saveBattleResults(battle: IBattle) {
    let battleLogData = 'SEP=,\ncount,turn,hero,action,position,weapon/ability,target,value\n';
    let turn = 1;
    for (let i = 0; i < battle.log.length; i++) {
      switch (battle.log[i].type) {
        case LogMessageType.MOVE:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].id +
            ',MOVE,' +
            battle.log[i].positionX +
            ' ' +
            battle.log[i].positionY +
            '\n';
          break;
        case LogMessageType.TURN_END:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TURN_END\n';
          turn++;
          break;
        case LogMessageType.WEAPON_DAMAGE:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].casterId +
            ',WEAPON_DAMAGE,,' +
            battle.log[i].equipId +
            ',' +
            battle.log[i].targetId +
            ',' +
            battle.log[i].value +
            '\n';
          break;
        case LogMessageType.ABILITY_DAMAGE:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].casterId +
            ',ABILITY_DAMAGE,,' +
            battle.log[i].abilityId +
            ',' +
            battle.log[i].targetId +
            ',' +
            battle.log[i].value +
            '\n';
          break;
        case LogMessageType.EFFECT_DAMAGE:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].casterId +
            ',AEFFECT_DAMAGE,,' +
            battle.log[i].abilityId +
            ',' +
            battle.log[i].targetId +
            ',' +
            battle.log[i].value +
            '\n';
          break;
        case LogMessageType.ABILITY_HEAL:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].casterId +
            ',ABILITY_HEAL,,' +
            battle.log[i].abilityId +
            ',' +
            battle.log[i].targetId +
            ',' +
            battle.log[i].value +
            '\n';
          break;
        case LogMessageType.ABILITY_CAST:
          battleLogData +=
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].casterId +
            ',ABILITY_CAST,,' +
            battle.log[i].abilityId +
            ',' +
            battle.log[i].targetId +
            '\n';
          break;
        case LogMessageType.UPGRADE_EQUIP:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',UPGRADE_EQUIP,,' + battle.log[i].equipId + '\n';
          break;
        case LogMessageType.LEARN_ABILITY:
          battleLogData +=
            i + ',' + turn + ',' + battle.log[i].id + ',LEARN_ABILITY,,' + battle.log[i].abilityId + '\n';
          break;
        case LogMessageType.TAKE_CRYSTAL:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TAKE_CRYSTAL\n';
          break;
        case LogMessageType.TAKE_MANA:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TAKE_MANA,,,' + battle.log[i].value + '\n';
          break;
        case LogMessageType.TAKE_ENERGY:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TAKE_ENERGY,,,' + battle.log[i].value + '\n';
          break;
        case LogMessageType.TURN_SKIP:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TURN_SKIP\n';
          break;
        case LogMessageType.DEATH:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',DEATH\n';
          break;
        case LogMessageType.WIN:
          battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',WIN\n';
          break;
      }
    }
    if (!fs.existsSync(Const.reportsPath)) {
      fs.mkdirSync(Const.reportsPath);
    }
    fs.writeFileSync(Const.reportsPath + '/' + battle.id + '.csv', battleLogData);
  }

  addToStatistics(battle: IBattle, winner: ITeam) {
    const targetFile = Const.statisticsFilePath + '_' + battle.scenario.id + '.csv';
    let statisticsData = '';
    if (!fs.existsSync(Const.reportsPath)) {
      fs.mkdirSync(Const.reportsPath);
    }

    switch (battle.scenario.id) {
      case '0':
        const loserTeam = battle.teams[0].id === winner.id ? battle.teams[1] : battle.teams[0];
        statisticsData +=
          battle.id +
          ',1,' +
          winner.heroes[0].id +
          ',' +
          winner.heroes[1].id +
          ',' +
          loserTeam.heroes[0].id +
          ',' +
          loserTeam.heroes[1].id +
          ',' +
          battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TURN_END).length +
          '\n';
        break;
    }

    if (!fs.existsSync(targetFile)) {
      let headers = 'SEP=,\nbattle,scenario,';
      switch (battle.scenario.id) {
        case '0':
          headers += 'winner1,winner2,loser1,loser2,turns\n';
          break;
      }
      fs.writeFileSync(targetFile, headers + statisticsData);
    } else {
      fs.appendFileSync(targetFile, statisticsData);
    }
  }

  saveTreeVisualization(rootNode: BotNode) {
    const tree = this.expandChildren(rootNode);
    if (Const.simulationInfo) {
      console.log('Total Nodes: ' + this.totalNodes + ', Unexpanded Nodes: ' + this.unexpandedNodes + ', Covarage: ' + ((1 - this.unexpandedNodes / this.totalNodes) * 100).toFixed(2) + '%');
    }
    this.totalNodes = 0;
    this.unexpandedNodes = 0;
    fs.writeFileSync(
      Const.mctsTreeReportPath + '/' + rootNode.state.id + '-' + +new Date() + '.json',
      JSON.stringify(tree)
    );
  }

  expandChildren(parentNode: BotNode) {
    const childrenNodeArray = Array.from(parentNode.children.values());
    const childrenArray = [];
    for (const child of childrenNodeArray) {
      this.totalNodes++;
      if (child.node) {
        childrenArray.push(this.expandChildren(child.node));
      } else {
        this.unexpandedNodes++;
        childrenArray.push({
          name: 'unexpanded',
          children: []
        });
      }
    }
    let name = '';
    if (parentNode.action) {
      switch (parentNode.action.type) {
        case ActionType.MOVE:
        case ActionType.PET_MOVE:
          name =
            parentNode.state.log.slice(-2, -1)[0].id +
            ' move to ' +
            parentNode.action.positionX +
            ',' +
            parentNode.action.positionY;
          break;
        case ActionType.WEAPON_DAMAGE:
          name =
            parentNode.action.casterId +
            ' deals ' +
            parentNode.state.log.slice(-2, -1)[0].value +
            ' damage to' +
            parentNode.action.targetId +
            ' with ' +
            parentNode.action.equipId;
          break;
        case ActionType.ABILITY:
        case ActionType.PET_ABILITY:
          name =
            parentNode.action.casterId +
            ' cast ' +
            parentNode.action.abilityId +
            ' on ' +
            (parentNode.action.targetId
              ? parentNode.action.targetId
              : '(' + parentNode.action.positionX + ',' + parentNode.action.positionY + ')') +
            (parentNode.state.log.slice(-2, -1)[0].value
              ? ' (damage/heal: ' + parentNode.state.log.slice(-2, -1)[0].value + ')'
              : '');
          break;
        case ActionType.UPGRADE_EQUIP:
          name = parentNode.state.log.slice(-2, -1)[0].id + ' upgrade equip: ' + parentNode.action.equipId;
          break;
        case ActionType.LEARN_ABILITY:
          name = parentNode.state.log.slice(-2, -1)[0].id + ' learn ability: ' + parentNode.action.abilityId;
          break;
        case ActionType.TURN_END:
          name = parentNode.state.log.slice(-2, -1)[0].id + ' end turn';
          break;
      }
    } else {
      name =
        parentNode.state.log[0].id +
        ' starts at ' +
        parentNode.state.log[0].positionX +
        ',' +
        parentNode.state.log[0].positionY;
    }

    return {
      name: name,
      hero: parentNode.state.log.length > 1 ? parentNode.state.log.slice(-2, -1)[0].id : parentNode.state.log[0].id,
      sims: parentNode.sims,
      wins: parentNode.wins,
      shortestWin: parentNode.shortestWin,
      type: parentNode.action ? parentNode.action.type : 0,
      children: childrenArray
    };
  }
}
