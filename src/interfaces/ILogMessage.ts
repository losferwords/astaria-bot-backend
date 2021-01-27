import { LogMessageType } from '../enums/log-message-type.enum';
import { IPosition } from './IPosition';

export interface ILogMessage {
    type: LogMessageType;
    id?: string;
    casterId?: string;
    targetId?: string;
    value?: string;
    position?: IPosition;
}
