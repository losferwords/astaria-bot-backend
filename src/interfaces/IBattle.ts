import { ILogMessage } from './ILogMessage';
import { IPosition } from './IPosition';
import { IScenario } from './IScenario';
import { ITeam } from './ITeam';

export interface IBattle {
  id: string;
  scenario: IScenario;
  crystalPositions: IPosition[],
  teams: ITeam[];
  queue: string[];
  log?: ILogMessage[];
}
