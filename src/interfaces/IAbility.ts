export interface IAbility {
  name: string;
  cd: number;
  energyCost: number;
  manaCost: number;
  isPassive: boolean;
  left: number;
}
