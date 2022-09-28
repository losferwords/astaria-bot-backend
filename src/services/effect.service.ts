/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IEffect } from 'src/interfaces/IEffect';
import { IHero } from 'src/interfaces/IHero';
import { HeroService } from './hero.service';

@Injectable()
export class EffectService {
  constructor(private heroService: HeroService) {}

  apply(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    return this[effect.id](battle, heroes, effect, target, isBeforeTurn);
  }

  // Paragon
  '11-sunder-armor'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor - 1;
    }
  }

  '12-shield-bash'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isSilenced = true;
  }

  '13-shoulder-to-shoulder'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 2;
      (target as IHero).will = (target as IHero).will + 2;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  '21-spear-throw'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost + 1;
    }
  }

  '23-defender'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isImmuneToDebuffs = true;
    target.regeneration = target.regeneration + 1;
  }

  '32-no-step-back'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 3;
    target.isImmuneToDebuffs = true;
  }

  '42-breakthrough'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  '43-rallying'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 3;
      (target as IHero).intellect = (target as IHero).intellect + 3;
      (target as IHero).armor = (target as IHero).armor + 3;
      (target as IHero).will = (target as IHero).will + 3;
    }
  }

  // Highlander
  '11-heavy-strike'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 1;
    }
  }

  '12-strong-grip'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 2;
      (target as IHero).will = (target as IHero).will + 1;
      target.isImmuneToDisarm = true;
    }
  }

  '22-freedom-spirit'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  '31-halving'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  '32-thunderer'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  '42-ancestral-power'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 3;
      (target as IHero).intellect = (target as IHero).intellect + 3;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  // Druid
  '11-crown-of-thorns'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (isBeforeTurn && !target.isPet) {
      this.heroService.spendMana(target as IHero, 2);
    }
  }

  '13-wound-healing'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 1;
    }
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will + 1;
    }
    target.regeneration = target.regeneration + 2;
    if (!target.isPet) {
      (target as IHero).mind = (target as IHero).mind + 2;
    }
  }

  '21-entangling-roots'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isImmobilized = true;
  }

  '23-breath-of-life'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
    }
  }

  '31-choking-vine'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isSilenced = true;
  }

  '33-power-of-the-pack'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 3;
      (target as IHero).will = (target as IHero).will + 3;
      (target as IHero).mind = (target as IHero).mind + 3;
    } else {
      target.regeneration = target.regeneration + 3;
    }
  }

  '43-symbiosis'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      const caster: IHero = this.heroService.getHeroById(effect.casterId, heroes);
      if (caster.strength > (target as IHero).strength) {
        (target as IHero).strength = caster.strength;
      } else {
        caster.strength = (target as IHero).strength;
      }

      if (caster.intellect > (target as IHero).intellect) {
        (target as IHero).intellect = caster.intellect;
      } else {
        caster.intellect = (target as IHero).intellect;
      }
    }
  }

  // Oracle
  '23-paranoia'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will - 1;
      (target as IHero).mind = (target as IHero).mind - 1;
    }
  }

  '33-mind-control'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  '43-amnesia'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).maxAllowedAbilityLevel = 1;
    }
  }

  // Avatar
  '22-cauterization'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will + 1;
    }
  }

  '23-scorch'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  '31-dragon-tail'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  '32-elements-control'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).armor = (target as IHero).armor + 2;
    (target as IHero).will = (target as IHero).will + 2;
    (target as IHero).mind = (target as IHero).mind + 2;
  }

  '41-harmony'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    const maxStat = Math.max(
      (target as IHero).strength,
      (target as IHero).intellect,
      (target as IHero).armor,
      (target as IHero).will
    );

    (target as IHero).strength = maxStat;
    (target as IHero).intellect = maxStat;
    (target as IHero).armor = maxStat;
    (target as IHero).will = maxStat;
  }

  // Shadow
  '13-debilitating-shot'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength - 1;
      (target as IHero).intellect = (target as IHero).intellect - 1;
    }
  }

  '23-blind'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isBlind = true;
  }

  '32-shadow-cloak'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).isInvisible = true;
  }

  // Lightbringer
  '21-aura-of-might'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      let extraStat = 2;
      const caster: IHero = this.heroService.getHeroById(effect.casterId, heroes);
      if (this.heroService.getCharEffectById(caster, '42-divine-radiance')) {
        extraStat = 4;
      }
      (target as IHero).strength = (target as IHero).strength + extraStat;
      (target as IHero).intellect = (target as IHero).intellect + extraStat;
    }
  }

  '22-aura-of-fortitude'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      let extraStat = 2;
      const caster: IHero = this.heroService.getHeroById(effect.casterId, heroes);
      if (this.heroService.getCharEffectById(caster, '42-divine-radiance')) {
        extraStat = 4;
      }
      (target as IHero).armor = (target as IHero).armor + extraStat;
      (target as IHero).will = (target as IHero).will + extraStat;
    }
  }

  '23-aura-of-light'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    let extraStat = 1;
    const caster: IHero = this.heroService.getHeroById(effect.casterId, heroes);
    if (this.heroService.getCharEffectById(caster, '42-divine-radiance')) {
      extraStat = 2;
    }
    if (!target.isPet) {
      (target as IHero).mind = (target as IHero).mind + extraStat;
    }
    target.regeneration = target.regeneration + extraStat;
  }

  '41-hammer-of-wrath'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  //Avenger
  '23-temporal-strike'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost + 1;
    }
  }

  '32-sand-storm-blind'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isBlind = true;
  }

  '41-excellence'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 2;
    (target as IHero).intellect = (target as IHero).intellect + 2;
  }

  '42-sand-form'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).isInvisible = true;
    (target as IHero).regeneration = (target as IHero).regeneration + 1;
  }
}
