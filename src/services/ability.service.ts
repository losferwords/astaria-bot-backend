import { Injectable } from '@nestjs/common';
import { HeroService } from './hero.service';
import { IAbility } from 'src/interfaces/IAbility';
import { IHero } from 'src/interfaces/IHero';
import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IBattle } from 'src/interfaces/IBattle';
import { IPosition } from 'src/interfaces/IPosition';
import { LogMessageType } from 'src/enums/log-message-type.enum';

@Injectable()
export class AbilityService {
  constructor(private heroService: HeroService) {}

  checkAbilityForUse(ability: IAbility, hero: IHero) {
    if (ability.targetType === AbilityTargetType.MOVE && hero.isImmobilized) {
      return false;
    }
    if (ability.cd === 0 && hero.energy - ability.energyCost >= 0 && hero.mana - ability.manaCost >= 0) {
      if (ability.needWeapon) {
        if (!hero.isDisarmed) {
          return true;
        }
      } else if (ability.isSpell) {
        if (!hero.isSilenced) {
          return true;
        }
      }
    }
    return false;
  }

  cast(ability: IAbility, battle: IBattle, caster: IHero, target?: IHero, position?: IPosition) {
    switch (ability.id) {
      case '11-sunder-armor':
        this.heroService.spendEnergy(caster, ability.energyCost);
        this.heroService.spendMana(caster, ability.manaCost);

        ability.left = ability.cd;

        let physDamage = caster.primaryWeapon.physDamage + caster.strength + 1 - target.armor;
        if (physDamage < 0) {
          physDamage = 0;
        }

        battle.log.push({
          type: LogMessageType.ABILITY_DAMAGE,
          casterId: caster.id,
          targetId: target.id,
          value: physDamage + ''
        });

        if (this.heroService.heroTakesDamage(battle, caster, target, physDamage)) {
          //add effect
        }

        return battle;
    }
  }
}
