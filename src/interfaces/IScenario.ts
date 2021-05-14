import { IBattle } from './IBattle';
import { ITeam } from './ITeam';
import { ITile } from './ITile';

export interface IScenario {
  id: string;
  teamSize: number[];
  tiles: ITile[][];
  tileSize: number;
  setHeroPositions: (teams: ITeam[]) => void;
  beforeTurn: (state: IBattle) => void;
  checkForWin: (teams: ITeam[]) => ITeam;
}
