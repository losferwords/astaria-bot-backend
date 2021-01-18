import { TileType } from '../../enums/tile-type.enum';
import { IMap } from '../../interfaces/IMap';
import { IPosition } from '../../interfaces/IPosition';
import { ITile } from '../../interfaces/ITile';

export class ChthonRuins implements IMap {
    scenarioId: string;
    tileSize: number;
    tiles: ITile[][];
    teamPositions: [IPosition[], IPosition[]];
    postamentPositions: IPosition[];

    constructor() {
        this.scenarioId = '1';
        this.tileSize = 40;
        this.tiles = [
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.WALL }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }],
            [{ type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }, { type: TileType.FLOOR }]
        ];
        this.teamPositions = [[{x: 0, y: 7}, {x: 1, y: 8}], [{x: 7, y: 0}, {x: 8, y: 1}]];
        this.postamentPositions = [{x: 1, y: 1}, {x: 5, y: 5}, {x: 7, y: 7}];
    }
}
