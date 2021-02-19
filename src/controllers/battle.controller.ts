import { Path, GET, POST, Return, Context, ServiceContext, QueryParam } from 'typescript-rest';
import { IBattle } from '../interfaces/IBattle';
import { IBattleSetup } from '../interfaces/IBattleSetup';
import { IPosition } from '../interfaces/IPosition';
import { BattleService } from '../services/battle.service';

const battleService: BattleService = new BattleService();

export class BattleController {
    @Context
    context: ServiceContext;

    @Path('/scenario-team-size')
    @GET
    async scenarioTeamSize(@QueryParam('id') id: string): Promise<number[]> {
        return battleService.getScenarioTeamSize(id);
    }

    @Path('/start-battle')
    @POST
    async startBattle(battleSetup: IBattleSetup): Promise<IBattle> {
        return battleService.startBattle(battleSetup);
    }

    @Path('/move-points')
    @GET
    async movePoints(@QueryParam('battleId') battleId: string): Promise<IPosition[]> {
        return battleService.getMovePoints(battleService.getBattleById(battleId));
    }

    @Path('/move-hero')
    @POST
    async moveHero({battleId, position}): Promise<IBattle> {
        return battleService.moveHero(battleId, position);
    }

    @Path('/end-turn')
    @POST
    async endTurn({battleId}): Promise<IBattle> {
        return battleService.endTurn(battleId);
    }

    @Path('/find-enemies')
    @GET
    async findEnemies(@QueryParam('battleId') battleId: string, @QueryParam('sourceHeroId') sourceHeroId: string, @QueryParam('radius') radius: number): Promise<string[]> {
        return battleService.findEnemies(battleService.getBattleById(battleId), sourceHeroId, radius);
    }

    @Path('/use-weapon')
    @POST
    async useWeapon({battleId, targetId, weaponId}): Promise<IBattle> {
        return battleService.useWeapon(battleId, targetId, weaponId);
    }
}
