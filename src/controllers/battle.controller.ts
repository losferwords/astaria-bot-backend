import { Path, GET, POST, Return, Context, ServiceContext, QueryParam } from "typescript-rest";
import { IBattle } from "../interfaces/IBattle";
import { IStartBattleRequest } from "../interfaces/IRequests";
import { BattleService } from "../services/battle.service";

const battleService: BattleService = new BattleService();

export class BattleController {
    @Context
    context: ServiceContext;

    @Path("/test")
    @GET
    async test(): Promise<string> {
        return new Promise<string>((resolve) => {
            resolve("Hello, World!");
        })
    }

    @Path("/scenario-team-size")
    @GET
    async scenarioTeamSize(@QueryParam("id") id: string): Promise<number[]> {
        return battleService.getScenarioTeamSize(id);
    }

    @Path("/start-battle")
    @POST
    async startBattle(startBattleRequest: IStartBattleRequest): Promise<Return.NewResource<IBattle>> {
        return new Promise<Return.NewResource<IBattle>>((resolve, reject) => {
            const requestURL = this.context.request.protocol + "://" + this.context.request.headers.host;
            battleService.startBattle(startBattleRequest.id, startBattleRequest.heroes).then((battle: IBattle) => {
                resolve(new Return.NewResource(requestURL + "/" + battle.id, battle));
            }).catch((err: any) => {
                reject(err);
            });
        });
    }
}