import { IPosition } from 'src/interfaces/IPosition';
import { TileType } from '../../enums/tile-type.enum';
import { IBattle } from '../../interfaces/IBattle';
import { IScenario } from '../../interfaces/IScenario';
import { ITeam } from '../../interfaces/ITeam';

const teamPositions: IPosition[][] = [[{ x: 0, y: 4 }], [{ x: 8, y: 4 }], [{ x: 4, y: 0 }]];

export class ArenaOfAcheos1x1x1 implements IScenario {
  static id = '3';
  static teamSize = [3, 1];
  id;
  teamSize;
  tileSize = 40;
  tiles = [
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.WALL },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ],
    [
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.FLOOR },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK },
      { type: TileType.BLANK }
    ]
  ];

  constructor() {
    this.id = ArenaOfAcheos1x1x1.id;
    this.teamSize = ArenaOfAcheos1x1x1.teamSize;
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
    for (let i = 0; i < state.teams.length; i++) {
      for (let j = 0; j < state.teams[i].heroes.length; j++) {
        if (state.teams[i].heroes[j].id === state.queue[0] && state.teams[i].heroes[j].abilities.length > 0) {
          state.teams[i].heroes[j].crystals += 1;
        }
      }
    }
  }

  checkForWin(teams: ITeam[]): ITeam {
    const teamsDeaths: number[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].heroes.length; j++) {
        if (teams[i].heroes[j].isDead) {
          teamsDeaths.push(1);
        } else {
          teamsDeaths.push(0);
        }
      }
    }
    if (teamsDeaths[0] === 0 && teamsDeaths[1] === 1 && teamsDeaths[2] === 1) {
      return teams[0];
    } else if (teamsDeaths[0] === 1 && teamsDeaths[1] === 0 && teamsDeaths[2] === 1) {
      return teams[1];
    } else if (teamsDeaths[0] === 1 && teamsDeaths[1] === 1 && teamsDeaths[2] === 0) {
      return teams[2];
    }
    return null;
  }
}
