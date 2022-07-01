import { IChar } from 'src/interfaces/IChar';
import { IPosition } from 'src/interfaces/IPosition';
import { TileType } from '../../enums/tile-type.enum';
import { IBattle } from '../../interfaces/IBattle';
import { IScenario } from '../../interfaces/IScenario';
import { ITeam } from '../../interfaces/ITeam';

const teamPositions: IPosition[][] = [
  [
    { x: 0, y: 7 },
    { x: 1, y: 8 }
  ],
  [
    { x: 7, y: 0 },
    { x: 8, y: 1 }
  ]
];

const crystalPositions: IPosition[] = [
  { x: 0, y: 0 },
  { x: 8, y: 0 },
  { x: 0, y: 8 },
  { x: 8, y: 8 }
];

const rooms: IPosition[][] = [
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 3 },
    { x: 1, y: 3 }
  ],
  [
    { x: 5, y: 0 },
    { x: 6, y: 0 },
    { x: 7, y: 0 },
    { x: 8, y: 0 },
    { x: 5, y: 1 },
    { x: 6, y: 1 },
    { x: 7, y: 1 },
    { x: 8, y: 1 },
    { x: 7, y: 2 },
    { x: 8, y: 2 },
    { x: 7, y: 3 },
    { x: 8, y: 3 }
  ],
  [
    { x: 0, y: 5 },
    { x: 1, y: 5 },
    { x: 0, y: 6 },
    { x: 1, y: 6 },
    { x: 0, y: 7 },
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 0, y: 8 },
    { x: 1, y: 8 },
    { x: 2, y: 8 },
    { x: 3, y: 8 }
  ],
  [
    { x: 7, y: 5 },
    { x: 8, y: 5 },
    { x: 7, y: 6 },
    { x: 8, y: 6 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
    { x: 7, y: 7 },
    { x: 8, y: 7 },
    { x: 5, y: 8 },
    { x: 6, y: 8 },
    { x: 7, y: 8 },
    { x: 8, y: 8 }
  ]
];

const teleportSpot: IPosition = { x: 4, y: 4 };

export class ArchaeanTemple implements IScenario {
  static id = '1';
  static teamSize = [2, 2];
  id;
  teamSize;
  tileSize = 40;
  tiles = [
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
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
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
    ],
    [
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.FLOOR },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM },
      { type: TileType.ROOM }
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
        if (!hasChar) {
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
              break;
            }
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
      if (teamDeathsCount === 2) {
        return teams[i === 0 ? 1 : 0];
      }
    }
    return null;
  }

  afterTakeCrystal(char: IChar, state: IBattle) {
    const teams = state.teams;
    let teleportIsBusy = false;

    for (let i = 0; i < teams.length; i++) {
      const heroes = teams[i].heroes;
      for (let j = 0; j < heroes.length; j++) {
        for (let v = 0; v < heroes[j].pets.length; v++) {
          if (heroes[j].pets[v].position.x === teleportSpot.x && heroes[j].pets[v].position.y === teleportSpot.y) {
            teleportIsBusy = true;
            break;
          }
        }
        if (heroes[j].position.x === teleportSpot.x && heroes[j].position.y === teleportSpot.y && !heroes[j].isDead) {
          teleportIsBusy = true;
        }
      }
    }
    if (!teleportIsBusy) {
      char.position = { x: teleportSpot.x, y: teleportSpot.y };
    }
  }
}
