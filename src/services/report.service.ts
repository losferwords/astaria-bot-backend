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
import { IHero } from 'src/interfaces/IHero';

@Injectable()
export class ReportService {
  constructor() {}

  totalNodes: number = 0;
  unexpandedNodes: number = 0;

  saveBattleResults(battle: IBattle, setupIndex: number) {
    let battleLogData = 'SEP=,\nsetup,count,turn,hero,action,position,weapon/ability,target,value\n';
    let turn = 1;
    for (let i = 0; i < battle.log.length; i++) {
      switch (battle.log[i].type) {
        case LogMessageType.MOVE:
          battleLogData +=
            setupIndex +
            ',' +
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
          battleLogData += setupIndex + ',' +i + ',' + turn + ',' + battle.log[i].id + ',TURN_END\n';
          turn++;
          break;
        case LogMessageType.WEAPON_DAMAGE:
          battleLogData +=
          setupIndex +
            ',' +
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
          setupIndex +
            ',' +
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
          setupIndex +
            ',' +
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
          setupIndex +
            ',' +
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
          setupIndex +
            ',' +
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
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',UPGRADE_EQUIP,,' + battle.log[i].equipId + '\n';
          break;
        case LogMessageType.LEARN_ABILITY:
          battleLogData +=
          setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',LEARN_ABILITY,,' + battle.log[i].abilityId + '\n';
          break;
        case LogMessageType.TAKE_CRYSTAL:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_CRYSTAL\n';
          break;
        case LogMessageType.TAKE_MANA:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_MANA,,,' + battle.log[i].value + '\n';
          break;
        case LogMessageType.TAKE_ENERGY:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_ENERGY,,,' + battle.log[i].value + '\n';
          break;
        case LogMessageType.TURN_SKIP:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TURN_SKIP\n';
          break;
        case LogMessageType.DEATH:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',DEATH\n';
          break;
        case LogMessageType.WIN:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',WIN\n';
          break;
      }
    }
    if (!fs.existsSync(Const.reportsPath)) {
      fs.mkdirSync(Const.reportsPath);
    }
    fs.writeFileSync(Const.reportsPath + '/' + battle.id + '.csv', battleLogData);
  }

  addToStatistics(battle: IBattle, winner: ITeam, setupIndex: number) {
    const targetFile = Const.statisticsFilePath + '_' + battle.scenario.id + '.csv';
    let statisticsData = '';
    if (!fs.existsSync(Const.reportsPath)) {
      fs.mkdirSync(Const.reportsPath);
    }

    winner.heroes = this.sortHeroes(winner);

    if (battle.scenario.id === '0') {
      const loserTeam = battle.teams[0].id === winner.id ? battle.teams[1] : battle.teams[0];
      loserTeam.heroes = this.sortHeroes(loserTeam);
      statisticsData +=        
        battle.id +
        ',' +
        setupIndex +
        ',' +
        winner.heroes[0].id +
        ',' +
        winner.heroes[0].primaryWeapon.level +
        ',' +
        (winner.heroes[0].secondaryWeapon ? winner.heroes[0].secondaryWeapon.level : '') +
        ',' +
        winner.heroes[0].chestpiece.level +
        ',' +
        (winner.heroes[0].abilities[0] ? winner.heroes[0].abilities[0].id : '') +
        ',' +
        (winner.heroes[0].abilities[1] ? winner.heroes[0].abilities[1].id : '') +
        ',' +
        (winner.heroes[0].abilities[2] ? winner.heroes[0].abilities[2].id : '') +
        ',' +
        (winner.heroes[0].abilities[3] ? winner.heroes[0].abilities[3].id : '') +
        ',' +
        winner.heroes[1].id +
        ',' +
        winner.heroes[1].primaryWeapon.level +
        ',' +
        (winner.heroes[1].secondaryWeapon ? winner.heroes[1].secondaryWeapon.level : '') +
        ',' +
        winner.heroes[1].chestpiece.level +
        ',' +
        (winner.heroes[1].abilities[0] ? winner.heroes[1].abilities[0].id : '') +
        ',' +
        (winner.heroes[1].abilities[1] ? winner.heroes[1].abilities[1].id : '') +
        ',' +
        (winner.heroes[1].abilities[2] ? winner.heroes[1].abilities[2].id : '') +
        ',' +
        (winner.heroes[1].abilities[3] ? winner.heroes[1].abilities[3].id : '') +
        ',' +
        loserTeam.heroes[0].id +
        ',' +
        loserTeam.heroes[0].primaryWeapon.level +
        ',' +
        (loserTeam.heroes[0].secondaryWeapon ? loserTeam.heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeam.heroes[0].chestpiece.level +
        ',' +
        (loserTeam.heroes[0].abilities[0] ? loserTeam.heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[1] ? loserTeam.heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[2] ? loserTeam.heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[3] ? loserTeam.heroes[0].abilities[3].id : '') +
        ',' +
        loserTeam.heroes[1].id +
        ',' +
        loserTeam.heroes[1].primaryWeapon.level +
        ',' +
        (loserTeam.heroes[1].secondaryWeapon ? loserTeam.heroes[1].secondaryWeapon.level : '') +
        ',' +
        loserTeam.heroes[1].chestpiece.level +
        ',' +
        (loserTeam.heroes[1].abilities[0] ? loserTeam.heroes[1].abilities[0].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[1] ? loserTeam.heroes[1].abilities[1].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[2] ? loserTeam.heroes[1].abilities[2].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[3] ? loserTeam.heroes[1].abilities[3].id : '') +
        ',' +
        battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TURN_END).length + 1) +
        ',' +
        (Const.botThinkTime / 1000).toFixed(0) +
        ',' +
        Const.explorationParameter +
        '\n';
    } else if (battle.scenario.id === '1') {
      const loserTeam = battle.teams[0].id === winner.id ? battle.teams[1] : battle.teams[0];
      loserTeam.heroes = this.sortHeroes(loserTeam);
      statisticsData +=
        battle.id +
        ',' +
        setupIndex +
        ',' +
        winner.heroes[0].id +
        ',' +
        winner.heroes[0].primaryWeapon.level +
        ',' +
        (winner.heroes[0].secondaryWeapon ? winner.heroes[0].secondaryWeapon.level : '') +
        ',' +
        winner.heroes[0].chestpiece.level +
        ',' +
        (winner.heroes[0].abilities[0] ? winner.heroes[0].abilities[0].id : '') +
        ',' +
        (winner.heroes[0].abilities[1] ? winner.heroes[0].abilities[1].id : '') +
        ',' +
        (winner.heroes[0].abilities[2] ? winner.heroes[0].abilities[2].id : '') +
        ',' +
        (winner.heroes[0].abilities[3] ? winner.heroes[0].abilities[3].id : '') +
        ',' +
        winner.heroes[1].id +
        ',' +
        winner.heroes[1].primaryWeapon.level +
        ',' +
        (winner.heroes[1].secondaryWeapon ? winner.heroes[1].secondaryWeapon.level : '') +
        ',' +
        winner.heroes[1].chestpiece.level +
        ',' +
        (winner.heroes[1].abilities[0] ? winner.heroes[1].abilities[0].id : '') +
        ',' +
        (winner.heroes[1].abilities[1] ? winner.heroes[1].abilities[1].id : '') +
        ',' +
        (winner.heroes[1].abilities[2] ? winner.heroes[1].abilities[2].id : '') +
        ',' +
        (winner.heroes[1].abilities[3] ? winner.heroes[1].abilities[3].id : '') +
        ',' +
        winner.heroes[2].id +
        ',' +
        winner.heroes[2].primaryWeapon.level +
        ',' +
        (winner.heroes[2].secondaryWeapon ? winner.heroes[2].secondaryWeapon.level : '') +
        ',' +
        winner.heroes[2].chestpiece.level +
        ',' +
        (winner.heroes[2].abilities[0] ? winner.heroes[2].abilities[0].id : '') +
        ',' +
        (winner.heroes[2].abilities[1] ? winner.heroes[2].abilities[1].id : '') +
        ',' +
        (winner.heroes[2].abilities[2] ? winner.heroes[2].abilities[2].id : '') +
        ',' +
        (winner.heroes[2].abilities[3] ? winner.heroes[2].abilities[3].id : '') +
        ',' +
        loserTeam.heroes[0].id +
        ',' +
        loserTeam.heroes[0].primaryWeapon.level +
        ',' +
        (loserTeam.heroes[0].secondaryWeapon ? loserTeam.heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeam.heroes[0].chestpiece.level +
        ',' +
        (loserTeam.heroes[0].abilities[0] ? loserTeam.heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[1] ? loserTeam.heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[2] ? loserTeam.heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeam.heroes[0].abilities[3] ? loserTeam.heroes[0].abilities[3].id : '') +
        ',' +
        loserTeam.heroes[1].id +
        ',' +
        loserTeam.heroes[1].primaryWeapon.level +
        ',' +
        (loserTeam.heroes[1].secondaryWeapon ? loserTeam.heroes[1].secondaryWeapon.level : '') +
        ',' +
        loserTeam.heroes[1].chestpiece.level +
        ',' +
        (loserTeam.heroes[1].abilities[0] ? loserTeam.heroes[1].abilities[0].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[1] ? loserTeam.heroes[1].abilities[1].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[2] ? loserTeam.heroes[1].abilities[2].id : '') +
        ',' +
        (loserTeam.heroes[1].abilities[3] ? loserTeam.heroes[1].abilities[3].id : '') +
        ',' +
        loserTeam.heroes[2].id +
        ',' +
        loserTeam.heroes[2].primaryWeapon.level +
        ',' +
        (loserTeam.heroes[2].secondaryWeapon ? loserTeam.heroes[2].secondaryWeapon.level : '') +
        ',' +
        loserTeam.heroes[2].chestpiece.level +
        ',' +
        (loserTeam.heroes[2].abilities[0] ? loserTeam.heroes[2].abilities[0].id : '') +
        ',' +
        (loserTeam.heroes[2].abilities[1] ? loserTeam.heroes[2].abilities[1].id : '') +
        ',' +
        (loserTeam.heroes[2].abilities[2] ? loserTeam.heroes[2].abilities[2].id : '') +
        ',' +
        (loserTeam.heroes[2].abilities[3] ? loserTeam.heroes[2].abilities[3].id : '') +
        ',' +
        battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TURN_END).length + 1) +
        ',' +
        (Const.botThinkTime / 1000).toFixed(0) +
        ',' +
        Const.explorationParameter +
        '\n';
    }

    if (!fs.existsSync(targetFile)) {
      let headers = 'SEP=,\nbattle,';
      switch (battle.scenario.id) {
        case '0':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,winner2,winner2-pw,winner2-sw,winner2-cp,winner2-ability1,winner2-ability2,winner2-ability3,winner2-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,crystals,turns,think-time,expl-p\n';
          break;
        case '1':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,winner2,winner2-pw,winner2-sw,winner2-cp,winner2-ability1,winner2-ability2,winner2-ability3,winner2-ability4,winner3,winner3-pw,winner3-sw,winner3-cp,winner3-ability1,winner3-ability2,winner3-ability3,winner3-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,loser3,loser3-pw,loser3-sw,loser3-cp,loser3-ability1,loser3-ability2,loser3-ability3,loser3-ability4,crystals,turns,think-time,expl-p\n';
          break;
      }
      fs.writeFileSync(targetFile, headers + statisticsData);
    } else {
      fs.appendFileSync(targetFile, statisticsData);
    }
  }

  sortHeroes(team: ITeam): IHero[] {
    return team.heroes.sort((a: IHero, b: IHero) => {
      return Const.reportSortingArray.indexOf(a.id) - Const.reportSortingArray.indexOf(b.id);
    });
  }

  saveTreeVisualization(rootNode: BotNode) {
    const tree = this.expandChildren(rootNode);
    if (Const.simulationInfo) {
      console.log(
        'Total Nodes: ' +
          this.totalNodes +
          ', Unexpanded Nodes: ' +
          this.unexpandedNodes +
          ', Coverage: ' +
          ((1 - this.unexpandedNodes / this.totalNodes) * 100).toFixed(2) +
          '%'
      );
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
    const isParentNodeWin = parentNode.state.log.find((l) => l.type === LogMessageType.WIN);
    if (isParentNodeWin) {
      childrenArray.push({
        name: 'battle end',
        children: []
      });
    } else {
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
    }

    let name = '';
    let activeCharId = parentNode.state.queue[0];
    if (parentNode.action) {
      switch (parentNode.action.type) {
        case ActionType.MOVE:
        case ActionType.PET_MOVE:
          name = activeCharId + ' move to ' + parentNode.action.positionX + ',' + parentNode.action.positionY;
          break;
        case ActionType.WEAPON_DAMAGE:
          const weaponDamage = parentNode.state.log
            .slice()
            .reverse()
            .find(
              (l) =>
                l.casterId === parentNode.action.casterId &&
                l.targetId === parentNode.action.targetId &&
                l.equipId === parentNode.action.equipId &&
                l.type === LogMessageType.WEAPON_DAMAGE
            ).value;
          activeCharId = parentNode.action.casterId;
          name =
            parentNode.action.casterId +
            ' deals ' +
            weaponDamage +
            ' damage to ' +
            parentNode.action.targetId +
            ' with ' +
            parentNode.action.equipId;
          break;
        case ActionType.ABILITY:
        case ActionType.PET_ABILITY:
          const abilityWithDamageMessage = parentNode.state.log
            .slice()
            .reverse()
            .find(
              (l) =>
                l.casterId === parentNode.action.casterId &&
                l.targetId === parentNode.action.targetId &&
                l.abilityId === parentNode.action.abilityId &&
                (l.type === LogMessageType.ABILITY_DAMAGE || l.type === LogMessageType.ABILITY_HEAL)
            );
          activeCharId = parentNode.action.casterId;
          name =
            parentNode.action.casterId +
            ' cast ' +
            parentNode.action.abilityId +
            ' on ' +
            (parentNode.action.targetId
              ? parentNode.action.targetId
              : '(' + parentNode.action.positionX + ',' + parentNode.action.positionY + ')') +
            (abilityWithDamageMessage ? ' (damage/heal: ' + abilityWithDamageMessage.value + ')' : '');
          break;
        case ActionType.UPGRADE_EQUIP:
          name = activeCharId + ' upgrade equip: ' + parentNode.action.equipId;
          break;
        case ActionType.LEARN_ABILITY:
          name = activeCharId + ' learn ability: ' + parentNode.action.abilityId;
          break;
        case ActionType.TURN_END:
          const endTurnActiveCharId = parentNode.state.log
            .slice()
            .reverse()
            .find((l) => l.type === LogMessageType.TURN_END).id;
          activeCharId = endTurnActiveCharId;
          name = endTurnActiveCharId + ' end turn';
          break;
      }
    } else {
      activeCharId = parentNode.state.log[0].id;
      name =
        parentNode.state.log[0].id +
        ' starts at ' +
        parentNode.state.log[0].positionX +
        ',' +
        parentNode.state.log[0].positionY;
    }

    return {
      name: name,
      hero: activeCharId,
      sims: parentNode.sims,
      wins: parentNode.wins,
      type: parentNode.action ? parentNode.action.type : 0,
      children: childrenArray
    };
  }
}
