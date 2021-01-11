import { IPosition } from './IPosition';
import { ITile } from './ITile';

export interface IMap {
    scenarioId: string;
    tiles: ITile[][];
    postamentPositions?: IPosition[];
    teamPositions: [IPosition[], IPosition[]]
}
