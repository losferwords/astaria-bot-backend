import { IBattle } from '../IBattle';
import { IChar } from '../IChar';
import { IHero } from '../IHero';

export interface ICharTakesDamageArgs {
  battle: IBattle;
  caster: IChar;
  heroes: IHero[];
  target: IChar;
  physDamage?: number;
  magicDamage?: number;
  directDamage?: number;
  weaponId?: string;
  abilityId?: string;
  effectId?: string;
  isOverload?: boolean;
  isSimulation: boolean;
}
