import { IPosition } from '../interfaces/IPosition';

export interface MoveCharDto {
  battleId: string;
  position: IPosition;
  petId: string;
}
