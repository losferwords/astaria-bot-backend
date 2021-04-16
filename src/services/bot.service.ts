import { Injectable } from '@nestjs/common';
import { Helper } from 'src/static/helper';
import { ActionType } from '../enums/action-type.enum';
import { IAction } from '../interfaces/IAction';
import { IBattle } from '../interfaces/IBattle';
import { BattleService } from './battle.service';

@Injectable()
export class BotService {
  constructor(private battleService: BattleService) {}

  botAction(battleId: string): IBattle {
    const battle = this.battleService.getBattleById(battleId);
    const actions = this.battleService.getAvailableActions(battle);
    const chosenAction = this.chooseAction(actions);
    return this.doAction(battle, chosenAction);
  }

  chooseAction(actions: IAction[]): IAction {
    return actions[Helper.randomInt(0, actions.length - 1)];
  }

  doAction(battle: IBattle, action: IAction): IBattle {
    switch (action.type) {
      case ActionType.MOVE:
        return this.battleService.moveHero(battle, action.position);
      case ActionType.WEAPON_DAMAGE:
        return this.battleService.useWeapon(battle, action.targetId, action.weaponId);
      case ActionType.TURN_END:
        return this.battleService.endTurn(battle);
    }
  }
}
