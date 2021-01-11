import { Path, GET, POST, Return, Context, ServiceContext, QueryParam } from 'typescript-rest';
import { IBattle } from '../interfaces/IBattle';
import { IBattleSetup } from '../interfaces/IBattleSetup';
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
}
