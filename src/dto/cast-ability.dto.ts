import { IPosition } from '../interfaces/IPosition';

export interface CastAbilityDto {
  abilityId: string;
  targetId?: string;
  position?: IPosition;
}
