import { IBattle } from '../interfaces/IBattle';
import { LogMessageType } from '../enums/log-message-type.enum';
import fs from 'fs';
import { Const } from '../static/const';
import { ITile } from '../interfaces/ITile';
import { ITeam } from '../interfaces/ITeam';
import { ILogMessage } from '../interfaces/ILogMessage';
import { IHero } from '../interfaces/IHero';

export class ReportService {
    constructor() {}

    saveBattleResults(battle: IBattle) {
        let battleLogData = 'SEP=,\ncount,turn,hero,action,position,weapon/ability,target,value\n';
        let turn = 1;
        for (let i = 0; i < battle.log.length; i++) {
            switch (battle.log[i].type) {
                case LogMessageType.MOVE:
                    battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',MOVE,' + battle.log[i].position.x + ' ' + battle.log[i].position.y + '\n';
                    break;
                case LogMessageType.TURN_END:
                    battleLogData += i + ',' + turn + ',' + battle.log[i].id + ',TURN_END\n';
                    turn++;
                    break;
                case LogMessageType.WEAPON_DAMAGE:
                    battleLogData += i + ',' + turn + ',' + battle.log[i].casterId + ',WEAPON_DAMAGE,,' + battle.log[i].id + ',' + battle.log[i].targetId + ',' + battle.log[i].value + '\n';
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
        const targetFile = Const.statisticsFilePath + '_' + battle.map.scenarioId + '.csv';
        let statisticsData = '';
        if (!fs.existsSync(Const.reportsPath)) {
            fs.mkdirSync(Const.reportsPath);
        }

        switch (battle.map.scenarioId) {
            case '1':
                const loserTeam = battle.teams[0].id === winner.id ? battle.teams[1] : battle.teams[0];
                statisticsData += battle.id + ',1,' + winner.heroes[0].id + ',' + winner.heroes[1].id + ',' + loserTeam.heroes[0].id + ',' + loserTeam.heroes[1].id + ',' + battle.log.filter((message: ILogMessage) => message.type === LogMessageType.TURN_END).length + '\n';
                break;
        }

        if (!fs.existsSync(targetFile)) {
            let headers = 'SEP=,\nbattle,scenario,';
            switch (battle.map.scenarioId) {
                case '1': headers += 'winner1,winner2,loser1,loser2,turns\n'; break;
            }
            fs.writeFileSync(targetFile, headers + statisticsData);
        } else {
            fs.appendFileSync(targetFile, statisticsData);
        }
    }
}
