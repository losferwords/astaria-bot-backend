import { IPosition } from 'src/interfaces/IPosition';
import { Helper } from 'src/static/helper';
import { TileType } from '../../enums/tile-type.enum';
import { IBattle } from '../../interfaces/IBattle';
import { IScenario } from '../../interfaces/IScenario';
import { ITeam } from '../../interfaces/ITeam';

const teamPositions = [
  [
    { x: 0, y: 7 },
    { x: 1, y: 8 }
  ],
  [
    { x: 7, y: 0 },
    { x: 8, y: 1 }
  ]
];

export class ChthonRuins implements IScenario {
  static id = '0';
  static teamSize = [2, 2];
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
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
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
      { type: TileType.FLOOR }
    ],
    [
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
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
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
      { type: TileType.FLOOR }
    ]
  ];

  constructor() {
    this.id = ChthonRuins.id;
    this.teamSize = ChthonRuins.teamSize;
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
    if (!state.crystalPositions.length) {
      const possibleSpots: IPosition[] = [
        {
          x: 1,
          y: 1
        },
        {
          x: 4,
          y: 4
        },
        {
          x: 7,
          y: 7
        }
      ];
      for (let i = 0; i < state.teams.length; i++) {
        for (let j = 0; j < state.teams[i].heroes.length; j++) {
          const spotIndex = possibleSpots.findIndex((spot) => {
            return spot.x === state.teams[i].heroes[j].position.x && spot.y === state.teams[i].heroes[j].position.y;
          });
          if (spotIndex > -1) {
            possibleSpots.splice(spotIndex, 1);
          }
          for (let k = 0; k < state.teams[i].heroes[j].pets.length; k++) {
            const spotIndex = possibleSpots.findIndex((spot) => {
              return (
                spot.x === state.teams[i].heroes[j].pets[k].position.x &&
                spot.y === state.teams[i].heroes[j].pets[k].position.y
              );
            });
            if (spotIndex > -1) {
              possibleSpots.splice(spotIndex, 1);
            }
          }
        }
      }

      if (possibleSpots.length) {
        const randomSpotIndex = Helper.randomInt(0, possibleSpots.length - 1);
        state.crystalPositions.push(possibleSpots[randomSpotIndex]);
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
}
