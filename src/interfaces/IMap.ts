import { IBattle } from './IBattle';
import { ITeam } from './ITeam';
import { ITile } from './ITile';

export interface IMap {
    scenarioId: string;
    tiles: ITile[][];
    tileSize: number;
    setHeroPositions: (teams: ITeam[]) => void;
    beforeTurn: () => void;
    checkForWin: (battle: IBattle) => ITeam;
}
