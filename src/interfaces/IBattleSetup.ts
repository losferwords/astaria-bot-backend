import { IHeroSetup } from './IHeroSetup';

export interface IBattleSetup {
    scenarioId: string;
    teamSetup: IHeroSetup[][];
}
