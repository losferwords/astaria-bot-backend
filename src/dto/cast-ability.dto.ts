import { IPosition } from 'src/interfaces/IPosition';

export interface CastAbilityDto {
  battleId: string;
  abilityId: string;
  targetId?: string;
  position?: IPosition;
}
