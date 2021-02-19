import { ActionType } from '../enums/action-type.enum';
import { IAction } from '../interfaces/IAction';
import { IBattle } from '../interfaces/IBattle';
import { BattleService } from './battle.service';

export class BotService {
    battleService: BattleService = new BattleService();

    constructor() {}

    getAvailableActions(battle: IBattle): IAction[] {
        const activeHero = this.battleService.getHeroById(battle.queue[0], battle);
        const actions: IAction[] = [];
        const moves = this.battleService.getMovePoints(battle);

        for (let i = 0; i < moves.length; i++) {
            actions.push({type: ActionType.MOVE, id: activeHero.id, position: moves[i]});
        }

        if (this.battleService.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
            const enemies = this.battleService.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range);
            for (let i = 0; i < enemies.length; i++) {
                actions.push({type: ActionType.WEAPON_DAMAGE, id: activeHero.primaryWeapon.id, casterId: activeHero.id, targetId: enemies[i]});
            }
        }
        if (activeHero.secondaryWeapon && this.battleService.canUseWeapon(activeHero, activeHero.secondaryWeapon)) {
            const enemies = this.battleService.findEnemies(battle, activeHero.id, activeHero.secondaryWeapon.range);
            for (let i = 0; i < enemies.length; i++) {
                actions.push({type: ActionType.WEAPON_DAMAGE, id: activeHero.secondaryWeapon.id, casterId: activeHero.id, targetId: enemies[i]});
            }
        }
        actions.push({type: ActionType.TURN_END, id: battle.queue[0]});
        return actions;
    }
}
