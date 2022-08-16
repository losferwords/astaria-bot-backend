import { ActionType } from '../enums/action-type.enum';

export interface IAction {
  /** type */
  t: ActionType;
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
