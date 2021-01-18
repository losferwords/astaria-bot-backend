import { IPosition } from './IPosition';
import { ITile } from './ITile';

export interface IMap {
    scenarioId: string;
    tiles: ITile[][];
    tileSize: number;
    postamentPositions?: IPosition[];
    teamPositions: [IPosition[], IPosition[]];
}
