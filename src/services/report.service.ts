import { IBattle } from '../interfaces/IBattle';
import { LogMessageType } from '../enums/log-message-type.enum';
import fs from 'fs';
import { Const } from '../static/const';

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
}
