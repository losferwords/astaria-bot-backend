import { Injectable } from '@nestjs/common';
import { IBattle } from '../interfaces/IBattle';
import { LogMessageType } from '../enums/log-message-type.enum';
import * as fs from 'fs';
import { Const } from '../static/const';
import { ITeam } from '../interfaces/ITeam';
import { ILogMessage } from '../interfaces/ILogMessage';
import { BotNode } from 'src/models/BotNode';
import { ActionType } from 'src/enums/action-type.enum';
import { IHero } from 'src/interfaces/IHero';

@Injectable()
export class ReportService {
  totalNodes = 0;
  unexpandedNodes = 0;

  saveBattleResults(battle: IBattle, setupIndex: number) {
    let battleLogData = 'SEP=,\nsetup,count,turn,hero,action,position,weapon/ability,target,value\n';
    let turn = 1;
    for (let i = 0; i < battle.log.length; i++) {
      switch (battle.log[i].t) {
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
            battle.log[i].x +
            ' ' +
            battle.log[i].y +
            '\n';
          break;
        case LogMessageType.TURN_END:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TURN_END\n';
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
            battle.log[i].c +
            ',WEAPON_DAMAGE,,' +
            battle.log[i].e +
            ',' +
            battle.log[i].tr +
            ',' +
            battle.log[i].v +
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
            battle.log[i].c +
            ',ABILITY_DAMAGE,,' +
            battle.log[i].a +
            ',' +
            battle.log[i].tr +
            ',' +
            battle.log[i].v +
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
            battle.log[i].c +
            ',ABILITY_HEAL,,' +
            battle.log[i].a +
            ',' +
            battle.log[i].tr +
            ',' +
            battle.log[i].v +
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
            battle.log[i].c +
            ',ABILITY_CAST,,' +
            battle.log[i].a +
            ',' +
            battle.log[i].tr +
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
            battle.log[i].c +
            ',EFFECT_DAMAGE,,' +
            battle.log[i].a +
            ',' +
            battle.log[i].tr +
            ',' +
            battle.log[i].v +
            '\n';
          break;
        case LogMessageType.OVERLOAD_DAMAGE:
          battleLogData +=
            setupIndex +
            ',' +
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].c +
            ',OVERLOAD_DAMAGE,,' +
            battle.log[i].a +
            ',' +
            battle.log[i].tr +
            ',' +
            battle.log[i].v +
            '\n';
          break;
        case LogMessageType.UPGRADE_EQUIP:
          battleLogData +=
            setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',UPGRADE_EQUIP,,' + battle.log[i].e + '\n';
          break;
        case LogMessageType.LEARN_ABILITY:
          battleLogData +=
            setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',LEARN_ABILITY,,' + battle.log[i].a + '\n';
          break;
        case LogMessageType.TAKE_CRYSTAL:
          battleLogData += setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_CRYSTAL\n';
          break;
        case LogMessageType.TAKE_MANA:
          battleLogData +=
            setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_MANA,,,' + battle.log[i].v + '\n';
          break;
        case LogMessageType.TAKE_ENERGY:
          battleLogData +=
            setupIndex + ',' + i + ',' + turn + ',' + battle.log[i].id + ',TAKE_ENERGY,,,' + battle.log[i].v + '\n';
          break;
        case LogMessageType.PET_SUMMON:
          battleLogData +=
            setupIndex +
            ',' +
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].id +
            ',PET_SUMMON,' +
            battle.log[i].x +
            ' ' +
            battle.log[i].y +
            '\n';
          break;
        case LogMessageType.PET_MOVE:
          battleLogData +=
            setupIndex +
            ',' +
            i +
            ',' +
            turn +
            ',' +
            battle.log[i].id +
            ',PET_MOVE,' +
            battle.log[i].x +
            ' ' +
            battle.log[i].y +
            '\n';
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
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
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
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
        '\n';
    } else if (battle.scenario.id === '2') {
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
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
        '\n';
    } else if (battle.scenario.id === '3') {
      const loserTeams = [];
      for (let i = 0; i < battle.teams.length; i++) {
        if (battle.teams[i].id !== winner.id) {
          battle.teams[i].heroes = this.sortHeroes(battle.teams[i]);
          loserTeams.push(battle.teams[i]);
        }
      }
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
        loserTeams[0].heroes[0].id +
        ',' +
        loserTeams[0].heroes[0].primaryWeapon.level +
        ',' +
        (loserTeams[0].heroes[0].secondaryWeapon ? loserTeams[0].heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeams[0].heroes[0].chestpiece.level +
        ',' +
        (loserTeams[0].heroes[0].abilities[0] ? loserTeams[0].heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[1] ? loserTeams[0].heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[2] ? loserTeams[0].heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[3] ? loserTeams[0].heroes[0].abilities[3].id : '') +
        ',' +
        loserTeams[1].heroes[0].id +
        ',' +
        loserTeams[1].heroes[0].primaryWeapon.level +
        ',' +
        (loserTeams[1].heroes[0].secondaryWeapon ? loserTeams[1].heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeams[1].heroes[0].chestpiece.level +
        ',' +
        (loserTeams[1].heroes[0].abilities[0] ? loserTeams[1].heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[1] ? loserTeams[1].heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[2] ? loserTeams[1].heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[3] ? loserTeams[1].heroes[0].abilities[3].id : '') +
        ',' +
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
        '\n';
    } else if (battle.scenario.id === '4') {
      const loserTeams = [];
      for (let i = 0; i < battle.teams.length; i++) {
        if (battle.teams[i].id !== winner.id) {
          battle.teams[i].heroes = this.sortHeroes(battle.teams[i]);
          loserTeams.push(battle.teams[i]);
        }
      }
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
        loserTeams[0].heroes[0].id +
        ',' +
        loserTeams[0].heroes[0].primaryWeapon.level +
        ',' +
        (loserTeams[0].heroes[0].secondaryWeapon ? loserTeams[0].heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeams[0].heroes[0].chestpiece.level +
        ',' +
        (loserTeams[0].heroes[0].abilities[0] ? loserTeams[0].heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[1] ? loserTeams[0].heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[2] ? loserTeams[0].heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeams[0].heroes[0].abilities[3] ? loserTeams[0].heroes[0].abilities[3].id : '') +
        ',' +
        loserTeams[1].heroes[0].id +
        ',' +
        loserTeams[1].heroes[0].primaryWeapon.level +
        ',' +
        (loserTeams[1].heroes[0].secondaryWeapon ? loserTeams[1].heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeams[1].heroes[0].chestpiece.level +
        ',' +
        (loserTeams[1].heroes[0].abilities[0] ? loserTeams[1].heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[1] ? loserTeams[1].heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[2] ? loserTeams[1].heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeams[1].heroes[0].abilities[3] ? loserTeams[1].heroes[0].abilities[3].id : '') +
        ',' +
        loserTeams[2].heroes[0].id +
        ',' +
        loserTeams[2].heroes[0].primaryWeapon.level +
        ',' +
        (loserTeams[2].heroes[0].secondaryWeapon ? loserTeams[2].heroes[0].secondaryWeapon.level : '') +
        ',' +
        loserTeams[2].heroes[0].chestpiece.level +
        ',' +
        (loserTeams[2].heroes[0].abilities[0] ? loserTeams[2].heroes[0].abilities[0].id : '') +
        ',' +
        (loserTeams[2].heroes[0].abilities[1] ? loserTeams[2].heroes[0].abilities[1].id : '') +
        ',' +
        (loserTeams[2].heroes[0].abilities[2] ? loserTeams[2].heroes[0].abilities[2].id : '') +
        ',' +
        (loserTeams[2].heroes[0].abilities[3] ? loserTeams[2].heroes[0].abilities[3].id : '') +
        ',' +
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
        '\n';
    } else if (battle.scenario.id === '5') {
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
        battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TAKE_CRYSTAL).length +
        ',' +
        (battle.log.filter((message: ILogMessage) => message.t === LogMessageType.TURN_END).length + 1) +
        '\n';
    }

    if (!fs.existsSync(targetFile)) {
      let headers = 'SEP=,\nbattle,setup,';
      switch (battle.scenario.id) {
        case '0':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,winner2,winner2-pw,winner2-sw,winner2-cp,winner2-ability1,winner2-ability2,winner2-ability3,winner2-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,crystals,turns\n';
          break;
        case '1':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,winner2,winner2-pw,winner2-sw,winner2-cp,winner2-ability1,winner2-ability2,winner2-ability3,winner2-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,crystals,turns\n';
          break;
        case '2':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,crystals,turns\n';
          break;
        case '3':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,crystals,turns\n';
          break;
        case '4':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,loser3,loser3-pw,loser3-sw,loser3-cp,loser3-ability1,loser3-ability2,loser3-ability3,loser3-ability4,crystals,turns\n';
          break;
        case '5':
          headers +=
            'winner1,winner1-pw,winner1-sw,winner1-cp,winner1-ability1,winner1-ability2,winner1-ability3,winner1-ability4,winner2,winner2-pw,winner2-sw,winner2-cp,winner2-ability1,winner2-ability2,winner2-ability3,winner2-ability4,loser1,loser1-pw,loser1-sw,loser1-cp,loser1-ability1,loser1-ability2,loser1-ability3,loser1-ability4,loser2,loser2-pw,loser2-sw,loser2-cp,loser2-ability1,loser2-ability2,loser2-ability3,loser2-ability4,crystals,turns\n';
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
    console.log(
      'Total Nodes: ' +
        this.totalNodes +
        ', Unexpanded Nodes: ' +
        this.unexpandedNodes +
        ', Coverage: ' +
        ((1 - this.unexpandedNodes / this.totalNodes) * 100).toFixed(2) +
        '%'
    );
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
    const isParentNodeWin = parentNode.state.log.find((l) => l.t === LogMessageType.WIN);
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
      switch (parentNode.action.t) {
        case ActionType.MOVE:
        case ActionType.PET_MOVE:
          name = activeCharId + ' move to ' + parentNode.action.x + ',' + parentNode.action.y;
          break;
        case ActionType.WEAPON_DAMAGE:
          const weaponDamage = parentNode.state.log
            .slice()
            .reverse()
            .find(
              (l) =>
                l.c === parentNode.action.c &&
                l.tr === parentNode.action.tr &&
                l.e === parentNode.action.e &&
                l.t === LogMessageType.WEAPON_DAMAGE
            ).v;
          activeCharId = parentNode.action.c;
          name =
            parentNode.action.c +
            ' deals ' +
            weaponDamage +
            ' damage to ' +
            parentNode.action.tr +
            ' with ' +
            parentNode.action.e;
          break;
        case ActionType.ABILITY:
        case ActionType.PET_ABILITY:
          const abilityWithDamageMessage = parentNode.state.log
            .slice()
            .reverse()
            .find(
              (l) =>
                l.c === parentNode.action.c &&
                l.tr === parentNode.action.tr &&
                l.a === parentNode.action.a &&
                (l.t === LogMessageType.ABILITY_DAMAGE || l.t === LogMessageType.ABILITY_HEAL)
            );
          activeCharId = parentNode.action.c;
          name =
            parentNode.action.c +
            ' cast ' +
            parentNode.action.a +
            ' on ' +
            (parentNode.action.tr
              ? parentNode.action.tr
              : '(' + parentNode.action.x + ',' + parentNode.action.y + ')') +
            (abilityWithDamageMessage ? ' (damage/heal: ' + abilityWithDamageMessage.v + ')' : '');
          break;
        case ActionType.UPGRADE_EQUIP:
          name = activeCharId + ' upgrade equip: ' + parentNode.action.e;
          break;
        case ActionType.LEARN_ABILITY:
          name = activeCharId + ' learn ability: ' + parentNode.action.a;
          break;
        case ActionType.TURN_END:
          const endTurnActiveCharId = parentNode.state.log
            .slice()
            .reverse()
            .find((l) => l.t === LogMessageType.TURN_END).id;
          activeCharId = endTurnActiveCharId;
          name = endTurnActiveCharId + ' end turn';
          break;
      }
    } else {
      activeCharId = parentNode.state.log[0].id;
      name = parentNode.state.log[0].id + ' starts at ' + parentNode.state.log[0].x + ',' + parentNode.state.log[0].y;
    }

    return {
      name: name,
      hero: activeCharId,
      sims: parentNode.sims,
      wins: parentNode.wins,
      type: parentNode.action ? parentNode.action.t : 0,
      children: childrenArray
    };
  }
}
