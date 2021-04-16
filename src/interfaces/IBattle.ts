import { ILogMessage } from './ILogMessage';
import { IScenario } from './IScenario';
import { ITeam } from './ITeam';

export interface IBattle {
  id: string;
  scenario: IScenario;
  teams: ITeam[];
  queue: string[];
  log?: ILogMessage[];
}
