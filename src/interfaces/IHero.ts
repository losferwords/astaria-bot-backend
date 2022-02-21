import { IAbility } from './IAbility';
import { IChar } from './IChar';
import { IEquip } from './IEquip';
import { IPet } from './IPet';

export interface IHero extends IChar {
  gender?: string;

  maxEnergy: number;
  maxMana: number;

  abilities: IAbility[];
  pets: IPet[];
  primaryWeapon: IEquip;
  secondaryWeapon?: IEquip;
  chestpiece: IEquip;

  strength: number;
  intellect: number;
  armor: number;
  will: number;
  mind: number;

  energy: number;
  mana: number;

  isDead: boolean;
  isInvisible: boolean;
  maxAllowedAbilityLevel: number;

  moveEnergyCost: number;
  extraWeaponEnergyCost: number;
  crystals: number;
}
