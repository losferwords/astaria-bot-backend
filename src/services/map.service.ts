import { Injectable } from '@nestjs/common';
import { TileType } from 'src/enums/tile-type.enum';
import { IHero } from 'src/interfaces/IHero';
import { IPosition } from 'src/interfaces/IPosition';
import { ITile } from 'src/interfaces/ITile';
import { Const } from 'src/static/const';

@Injectable()
export class MapService {
  constructor() {}

  findNearestPoints(position: IPosition, tiles: ITile[][], radius: number): IPosition[] {
    const points = [];
    for (let i = -radius; i <= radius; i++) {
      if (position.x + i >= 0 && position.x + i < tiles[0].length) {
        for (let j = -radius; j <= radius; j++) {
          if (position.y + j >= 0 && position.y + j < tiles.length) {
            points.push({ x: position.x + i, y: position.y + j });
          }
        }
      }
    }
    return points;
  }

  rayTrace(startCoordinates: IPosition, endCoordinates: IPosition, tiles: ITile[][], heroes: IHero[]): boolean {
    const coordinatesArray = [];
    const tileSize = Const.rayTracePrecision;

    let x1 = startCoordinates.x * tileSize + tileSize / 2;
    let y1 = startCoordinates.y * tileSize + tileSize / 2;
    const x2 = endCoordinates.x * tileSize + tileSize / 2;
    const y2 = endCoordinates.y * tileSize + tileSize / 2;

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    coordinatesArray.push({ x: x1, y: y1 });

    while (!(x1 === x2 && y1 === y2)) {
      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
      coordinatesArray.push({ x: x1, y: y1 });
    }

    for (let i = 0; i < coordinatesArray.length; i++) {
      const x = coordinatesArray[i].x;
      const y = coordinatesArray[i].y;

      const localX = Math.floor(x / tileSize);
      const localY = Math.floor(y / tileSize);

      if (
        x % tileSize === 0 ||
        y % tileSize === 0 ||
        (startCoordinates.x === localX && startCoordinates.y === localY) ||
        (endCoordinates.x === localX && endCoordinates.y === localY)
      ) {
        continue;
      }

      if (this.checkTileForObstacle({ x: localX, y: localY }, tiles, heroes)) {
        return true;
      }
    }
    return false;
  }

  checkTileForObstacle(position: IPosition, tiles: ITile[][], heroes: IHero[]): boolean {
    if (tiles[position.y] && tiles[position.y][position.x] && tiles[position.y][position.x].type === TileType.FLOOR) {
      for (let i = 0; i < heroes.length; i++) {
        for (let j = 0; j < heroes[i].pets.length; j++) {
          if (heroes[i].pets[j].position.x === position.x && heroes[i].pets[j].position.y === position.y) {
            return true;
          }
        }
        if (heroes[i].position.x === position.x && heroes[i].position.y === position.y && !heroes[i].isDead) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  getMovePoints(activeHeroPosition: IPosition, radius: number = 1, tiles: ITile[][], heroes: IHero[]): IPosition[] {
    const points = this.findNearestPoints(activeHeroPosition, tiles, radius);
    const availablePoints = [];
    for (let i = 0; i < points.length; i++) {
      if (!this.checkTileForObstacle(points[i], tiles, heroes)) {
        availablePoints.push(points[i]);
      }
    }
    return availablePoints;
  }
}