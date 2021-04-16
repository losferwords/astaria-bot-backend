import { IHeroSetup } from '../interfaces/IHeroSetup';

export interface IBattleSetupDto {
  scenarioId: string;
  teamSetup: IHeroSetup[][];
}
