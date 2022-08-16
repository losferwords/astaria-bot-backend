import { LogMessageType } from '../enums/log-message-type.enum';

export interface ILogMessage {
  /** type */
  t: LogMessageType;
  /** id */
  id?: string;
  /** casterId */
  c?: string;
  /** targetId */
  tr?: string;
  /** equipId */
  e?: string;
  /** abilityId */
  a?: string;
  /** value */
  v?: string;
  /** positionX */
  x?: number;
  /** positionY */
  y?: number;
}
