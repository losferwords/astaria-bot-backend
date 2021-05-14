import { AbilityTargetType } from '../enums/ability-target-type.enum';

export interface IAbility {
  id: string;
  level: number;
  range: number;
  cd: number;
  energyCost: number;
  manaCost: number;
  needWeapon: boolean;
  isSpell: boolean;
  isPassive: boolean;
  left: number;
  targetType: AbilityTargetType,
}
