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

  beforeTurn() {}

  checkForWin(battle: IBattle): ITeam {
    for (let i = 0; i < battle.teams.length; i++) {
      let teamDeathsCount = 0;
      for (let j = 0; j < battle.teams[i].heroes.length; j++) {
        if (battle.teams[i].heroes[j].isDead) {
          teamDeathsCount++;
        }
      }
      if (teamDeathsCount === 2) {
        return battle.teams[i + 1 === 2 ? 0 : 1];
      }
    }
  }
}
