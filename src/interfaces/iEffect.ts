export interface IEffect {
  name: string;
  duration: number;
  left: number;
  caster?: string;
  isBuff: boolean;
}
