import { ITeamSetup } from './ITeamSetup';

export interface IBattleSetup {
    scenarioId: string;
    teamSetup: ITeamSetup[][];
}
