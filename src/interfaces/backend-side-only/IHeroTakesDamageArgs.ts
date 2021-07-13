import { IBattle } from '../IBattle';
import { IHero } from '../IHero';

export interface IHeroTakesDamageArgs {
  battle: IBattle;
  caster: IHero;
  heroes: IHero[];
  target: IHero;
  physDamage?: number;
  magicDamage?: number;
  directDamage?: number;
  weaponId?: string;
  abilityId?: string;
  effectId?: string;
  isSimulation: boolean;
}
