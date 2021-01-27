import { TileType } from '../enums/tile-type.enum';
import { IEffect } from './IEffect';

export interface ITile {
    type: TileType;
    effects?: IEffect[];
}
