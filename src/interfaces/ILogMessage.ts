import { LogMessageType } from '../enums/log-message-type.enum';

export interface ILogMessage {
  type: LogMessageType;
  id?: string;
  casterId?: string;
  targetId?: string;
  equipId?: string;
  abilityId?: string;
  value?: string;
  positionX?: number;
  positionY?: number;
}
