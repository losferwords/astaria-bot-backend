import { ILogMessage } from './ILogMessage';
import { IMap } from './IMap';
import { ITeam } from './ITeam';

export interface IBattle {
    id: string;
    map: IMap;
    teams: ITeam[];
    queue: string[];
    log?: ILogMessage[];
}
