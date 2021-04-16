import { IPosition } from 'src/interfaces/IPosition';

export interface MoveHeroDto {
  battleId: string;
  position: IPosition;
}
