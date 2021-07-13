export interface IEffect {
  id: string;
  duration: number;
  left?: number;
  casterId?: string;
  isBuff: boolean;
  isRemovable: boolean;
}
