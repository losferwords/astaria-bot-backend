import { Injectable } from '@nestjs/common';
import { IEffect } from 'src/interfaces/IEffect';
import { IHero } from 'src/interfaces/IHero';
import { Const } from 'src/static/const';
import { HeroService } from './hero.service';

@Injectable()
export class EffectService {
  constructor(private heroService: HeroService) {}

  apply(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    return this[effect.id](effect, target, isBeforeTurn);
  }

  // Paragon
  '11-sunder-armor'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.armor = target.armor - 1;
    if (target.armor < 0) {
      target.armor = 0;
    }
  }

  '12-shield-bash'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.isSilenced = true;
  }

  '13-shoulder-to-shoulder'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.armor = target.armor + 1;
    if (target.armor > Const.maxPrimaryAttributes) {
      target.armor = Const.maxPrimaryAttributes;
    }
    target.will = target.will + 1;
    if (target.will > Const.maxPrimaryAttributes) {
      target.will = Const.maxPrimaryAttributes;
    }
  }

  '21-spear-throw'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.moveEnergyCost = target.moveEnergyCost + 1;
  }

  // Highlander
  '11-shoulder-punch'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.strength = target.strength + 1;
    if (target.strength > Const.maxPrimaryAttributes) {
      target.strength = Const.maxPrimaryAttributes;
    }
  }

  '12-strong-grip'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.strength = target.strength + 2;
    if (target.strength > Const.maxPrimaryAttributes) {
      target.strength = Const.maxPrimaryAttributes;
    }
    target.isImmuneToDisarm = true;
  }

  // Druid
  '11-crown-of-thorns'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    if (isBeforeTurn) {
      this.heroService.spendMana(target, 1);
    }
  }

  '13-healing-wounds'(effect: IEffect, target: IHero, isBeforeTurn: boolean) {
    target.regeneration = target.regeneration + 1;
    if (target.regeneration > Const.maxSecondaryAttributes) {
      target.regeneration = Const.maxSecondaryAttributes;
    }
  }
}
