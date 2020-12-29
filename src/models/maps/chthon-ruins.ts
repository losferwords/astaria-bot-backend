import { TileType } from "../../enums/tile-type.enum";
import { IMap } from "../../interfaces/IMap";

export class ChthonRuins implements IMap {
    id: "1";
    tiles: [
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
    teamPositions: [[{x: 0, y: 7}, {x: 1, y: 8}], [{x: 7, y: 0}, {x: 8, y: 1}]];
    postamentPositions: [{x: 1, y: 1}, {x: 5, y: 5}, {x: 7, y: 7}]
}