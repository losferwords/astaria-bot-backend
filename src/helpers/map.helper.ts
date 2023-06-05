import { TileType } from 'src/enums/tile-type.enum';
import { IChar } from 'src/interfaces/IChar';
import { IHero } from 'src/interfaces/IHero';
import { IPosition } from 'src/interfaces/IPosition';
import { ITile } from 'src/interfaces/ITile';
import { Const } from 'src/static/const';

export default class MapHelper {
  static findNearestPoints(position: IPosition, tiles: ITile[][], radius: number): IPosition[] {
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

  static rayTrace(startCoordinates: IPosition, endCoordinates: IPosition, tiles: ITile[][], heroes: IHero[]): boolean {
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

  private static checkTileForObstacle(
    position: IPosition,
    tiles: ITile[][],
    heroes: IHero[],
    ignoreObstacles?: boolean
  ): boolean {
    if (
      tiles[position.y] &&
      tiles[position.y][position.x] &&
      (tiles[position.y][position.x].type === TileType.FLOOR || tiles[position.y][position.x].type === TileType.ROOM)
    ) {
      if (ignoreObstacles) {
        return false;
      }
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

  static getMovePoints(
    activeHeroPosition: IPosition,
    radius = 1,
    tiles: ITile[][],
    heroes: IHero[],
    ignoreRaytrace?: boolean,
    ignoreObstacles?: boolean
  ): IPosition[] {
    const points = this.findNearestPoints(activeHeroPosition, tiles, radius);
    const availablePoints = [];
    for (let i = 0; i < points.length; i++) {
      if (radius === 1 || ignoreRaytrace) {
        if (!this.checkTileForObstacle(points[i], tiles, heroes, ignoreObstacles)) {
          availablePoints.push(points[i]);
        }
      } else {
        if (!this.rayTrace(activeHeroPosition, points[i], tiles, heroes)) {
          if (!this.checkTileForObstacle(points[i], tiles, heroes, ignoreObstacles)) {
            availablePoints.push(points[i]);
          }
        }
      }
    }
    return availablePoints;
  }

  static knockBack(target: IChar, charPosition: IPosition, tiles: ITile[][], heroes: IHero[]) {
    const direction: IPosition = { x: 0, y: 0 };

    if (charPosition.x < target.position.x) {
      direction.x = 1;
    } else if (charPosition.x > target.position.x) {
      direction.x = -1;
    }

    if (charPosition.y < target.position.y) {
      direction.y = 1;
    } else if (charPosition.y > target.position.y) {
      direction.y = -1;
    }

    const newPosition = { x: target.position.x + direction.x, y: target.position.y + direction.y };

    if (
      !this.checkTileForObstacle(newPosition, tiles, heroes) &&
      newPosition.x >= 0 &&
      newPosition.x < tiles[0].length &&
      newPosition.y >= 0 &&
      newPosition.y < tiles.length
    ) {
      target.position.x = newPosition.x;
      target.position.y = newPosition.y;
    }
  }

  static attraction(target: IChar, charPosition: IPosition, tiles: ITile[][], heroes: IHero[]) {
    const direction: IPosition = { x: 0, y: 0 };

    if (charPosition.x < target.position.x) {
      direction.x = -1;
    } else if (charPosition.x > target.position.x) {
      direction.x = 1;
    }

    if (charPosition.y < target.position.y) {
      direction.y = -1;
    } else if (charPosition.y > target.position.y) {
      direction.y = 1;
    }

    const newPosition = { x: target.position.x + direction.x, y: target.position.y + direction.y };

    if (
      !this.checkTileForObstacle(newPosition, tiles, heroes) &&
      newPosition.x >= 0 &&
      newPosition.x < tiles[0].length &&
      newPosition.y >= 0 &&
      newPosition.y < tiles.length
    ) {
      target.position.x = newPosition.x;
      target.position.y = newPosition.y;
    }
  }

  static charge(targetPosition: IPosition, char: IChar, tiles: ITile[][], heroes: IHero[]) {
    const direction: IPosition = { x: 0, y: 0 };

    if (char.position.x < targetPosition.x) {
      direction.x = 1;
    } else if (char.position.x > targetPosition.x) {
      direction.x = -1;
    }

    if (char.position.y < targetPosition.y) {
      direction.y = 1;
    } else if (char.position.y > targetPosition.y) {
      direction.y = -1;
    }

    const newPosition = { x: targetPosition.x - direction.x, y: targetPosition.y - direction.y };

    if (!this.checkTileForObstacle(newPosition, tiles, heroes)) {
      char.position.x = newPosition.x;
      char.position.y = newPosition.y;
    } else {
      // Diagonal tile is busy, but target is visible for ability,
      // so we move to alternative tile
      if (newPosition.x === char.position.x) {
        newPosition.x = targetPosition.x;
      } else if (newPosition.y === char.position.y) {
        newPosition.y = targetPosition.y;
      }

      if (!this.checkTileForObstacle(newPosition, tiles, heroes)) {
        char.position.x = newPosition.x;
        char.position.y = newPosition.y;
      }
    }
  }
}
