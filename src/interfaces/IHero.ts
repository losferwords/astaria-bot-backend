import { IAbility } from './IAbility';
import { IChar } from './IChar';
import { IEffect } from './IEffect';
import { IEquip } from './IEquip';
import { IPet } from './IPet';

export interface IHero extends IChar {
  gender: string;

  maxEnergy: number;
  maxHealth: number;
  maxMana: number;

  effects: IEffect[];
  abilities: IAbility[];
  pets: IPet[];
  primaryWeapon?: IEquip;
  secondaryWeapon?: IEquip;
  chestpiece?: IEquip;

  strength: number;
  intellect: number;
  armor: number;
  will: number;
  regeneration: number;
  mind: number;

  energy: number;
  health: number;
  mana: number;

  isDead: boolean;
  isInvisible: boolean;
  isSilenced: boolean;
  isDisarmed: boolean;
  isStunned: boolean;
  isImmobilized: boolean;

  moveEnergyCost: number;
  crystals: number;

  beforeTurn: () => void;
  calcHero: () => void;
}
