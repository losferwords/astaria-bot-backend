import { IPosition } from 'src/interfaces/IPosition';
import { TileType } from '../../enums/tile-type.enum';
import { IBattle } from '../../interfaces/IBattle';
import { IScenario } from '../../interfaces/IScenario';
import { ITeam } from '../../interfaces/ITeam';

const teamPositions: IPosition[][] = [
  [
    { x: 0, y: 11 },
    { x: 0, y: 12 },
    { x: 1, y: 12 }
  ],
  [
    { x: 11, y: 0 },
    { x: 12, y: 0 },
    { x: 12, y: 1 }
  ]
];

const crystalPositions: IPosition[] = [
  { x: 3, y: 3 },
  { x: 9, y: 3 },
  { x: 3, y: 9 },
  { x: 9, y: 9 }
];

const rooms: IPosition[][] = [
  [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 1, y: 4 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 }
  ],
  [
    { x: 8, y: 1 },
    { x: 10, y: 1 },
    { x: 11, y: 1 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
    { x: 9, y: 2 },
    { x: 10, y: 2 },
    { x: 11, y: 2 },
    { x: 8, y: 3 },
    { x: 9, y: 3 },
    { x: 10, y: 3 },
    { x: 7, y: 4 },
    { x: 8, y: 4 },
    { x: 9, y: 4 },
    { x: 10, y: 4 },
    { x: 11, y: 4 },
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 10, y: 5 }
  ],
  [
    { x: 2, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
    { x: 5, y: 8 },
    { x: 2, y: 9 },
    { x: 3, y: 9 },
    { x: 4, y: 9 },
    { x: 1, y: 10 },
    { x: 2, y: 10 },
    { x: 3, y: 10 },
    { x: 4, y: 10 },
    { x: 5, y: 10 },
    { x: 1, y: 11 },
    { x: 2, y: 11 },
    { x: 4, y: 11 }
  ],
  [
    { x: 7, y: 7 },
    { x: 8, y: 7 },
    { x: 10, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 8 },
    { x: 9, y: 8 },
    { x: 10, y: 8 },
    { x: 11, y: 8 },
    { x: 8, y: 9 },
    { x: 9, y: 9 },
    { x: 10, y: 9 },
    { x: 7, y: 10 },
    { x: 8, y: 10 },
    { x: 9, y: 10 },
    { x: 10, y: 10 },
    { x: 11, y: 10 },
    { x: 8, y: 11 },
    { x: 10, y: 11 },
    { x: 11, y: 11 }
  ]
];

export class ArchaeanTemple implements IScenario {
  static id = '1';
  static teamSize = [2, 3];
  id;
  teamSize;
  tileSize = 40;
  tiles = [
    [
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR }
    ]
  ];

  constructor() {
    this.id = ArchaeanTemple.id;
    this.teamSize = ArchaeanTemple.teamSize;
  }

  setHeroPositions(teams: ITeam[]) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].heroes.length; j++) {
        teams[i].heroes[j].position.x = teamPositions[i][j].x;
        teams[i].heroes[j].position.y = teamPositions[i][j].y;
      }
    }
  }

  beforeTurn(state: IBattle) {
    for (let i = 0; i < rooms.length; i++) {
      let hasChar = false;
      for (let j = 0; j < state.teams.length; j++) {
        for (let k = 0; k < state.teams[j].heroes.length; k++) {
          if (
            rooms[i].find(
              (r) =>
                !state.teams[j].heroes[k].isDead &&
                ((r.x === state.teams[j].heroes[k].position.x && r.y === state.teams[j].heroes[k].position.y) ||
                  state.teams[j].heroes[k].pets.find((pet) => r.x === pet.position.x && r.y === pet.position.y))
            )
          ) {
            hasChar = true;
          }
        }
      }
      if (
        !hasChar &&
        !state.crystalPositions.find((cp) => cp.x === crystalPositions[i].x && cp.y === crystalPositions[i].y)
      ) {
        state.crystalPositions.push(crystalPositions[i]);
      }
    }
  }

  checkForWin(teams: ITeam[]): ITeam {
    for (let i = 0; i < teams.length; i++) {
      let teamDeathsCount = 0;
      for (let j = 0; j < teams[i].heroes.length; j++) {
        if (teams[i].heroes[j].isDead) {
          teamDeathsCount++;
        }
      }
      if (teamDeathsCount === 3) {
        return teams[i === 0 ? 1 : 0];
      }
    }
    return null;
  }
}
