import { Injectable } from '@nestjs/common';
import { IChar } from 'src/interfaces/IChar';
import { IEffect } from 'src/interfaces/IEffect';
import { IHero } from 'src/interfaces/IHero';
import { Const } from 'src/static/const';
import { HeroService } from './hero.service';

@Injectable()
export class EffectService {
  constructor(private heroService: HeroService) {}

  apply(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    return this[effect.id](effect, target, isBeforeTurn);
  }

  // Paragon
  '11-sunder-armor'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor - 1;
      if ((target as IHero).armor < 0) {
        (target as IHero).armor = 0;
      }
    }
  }

  '12-shield-bash'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will - 1;
      if ((target as IHero).will < 0) {
        (target as IHero).will = 0;
      }
    }
    target.isSilenced = true;
  }

  '13-shoulder-to-shoulder'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 1;
      if ((target as IHero).armor > Const.maxPrimaryAttributes) {
        (target as IHero).armor = Const.maxPrimaryAttributes;
      }
      (target as IHero).will = (target as IHero).will + 1;
      if ((target as IHero).will > Const.maxPrimaryAttributes) {
        (target as IHero).will = Const.maxPrimaryAttributes;
      }
    }
  }

  '21-spear-throw'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost + 1;
    }
  }

  '32-no-step-back'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 2;
    if ((target as IHero).strength > Const.maxPrimaryAttributes) {
      (target as IHero).strength = Const.maxPrimaryAttributes;
    }
    target.isImmuneToDebuffs = true;
  }

  '42-breakthrough'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  '43-rallying'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 2;
      if ((target as IHero).strength > Const.maxPrimaryAttributes) {
        (target as IHero).strength = Const.maxPrimaryAttributes;
      }
      (target as IHero).intellect = (target as IHero).intellect + 2;
      if ((target as IHero).intellect > Const.maxPrimaryAttributes) {
        (target as IHero).intellect = Const.maxPrimaryAttributes;
      }
      (target as IHero).armor = (target as IHero).armor + 2;
      if ((target as IHero).armor > Const.maxPrimaryAttributes) {
        (target as IHero).armor = Const.maxPrimaryAttributes;
      }
      (target as IHero).will = (target as IHero).will + 2;
      if ((target as IHero).will > Const.maxPrimaryAttributes) {
        (target as IHero).will = Const.maxPrimaryAttributes;
      }
    }
  }

  // Highlander
  '11-heavy-strike'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 1;
      if ((target as IHero).strength > Const.maxPrimaryAttributes) {
        (target as IHero).strength = Const.maxPrimaryAttributes;
      }
    }
  }

  '12-strong-grip'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 2;
      if ((target as IHero).strength > Const.maxPrimaryAttributes) {
        (target as IHero).strength = Const.maxPrimaryAttributes;
      }
      (target as IHero).isImmuneToDisarm = true;
    }
  }

  '22-freedom-spirit'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
    }
  }

  // Druid
  '11-crown-of-thorns'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (isBeforeTurn && !target.isPet) {
      this.heroService.spendMana(target as IHero, 1);
    }
  }

  '13-wound-healing'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.regeneration = target.regeneration + 1;
    if (target.regeneration > Const.maxSecondaryAttributes) {
      target.regeneration = Const.maxSecondaryAttributes;
    }
  }

  '21-entangling-roots'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength - 1;
      if ((target as IHero).strength < 0) {
        (target as IHero).strength = 0;
      }

      (target as IHero).intellect = (target as IHero).intellect - 1;
      if ((target as IHero).intellect < 0) {
        (target as IHero).intellect = 0;
      }
    }

    target.isImmobilized = true;
  }

  '23-breath-of-life'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
    }
  }

  // Oracle
  '23-paranoia'(effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will - 2;
      if ((target as IHero).will < 0) {
        (target as IHero).will = 0;
      }

      (target as IHero).mind = (target as IHero).mind - 2;
      if ((target as IHero).mind < 0) {
        (target as IHero).mind = 0;
      }
    }
  }
}
