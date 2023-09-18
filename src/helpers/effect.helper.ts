/* eslint-disable @typescript-eslint/no-unused-vars */
import CharHelper from 'src/helpers/char.helper';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IEffect } from 'src/interfaces/IEffect';
import { IHero } from 'src/interfaces/IHero';

export default class EffectHelper {
  static apply(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    return this[effect.id](battle, heroes, effect, target, isBeforeTurn);
  }

  // Paragon
  static '11-sunder-armor'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor - 1;
    }
  }

  static '12-shield-bash'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isSilenced = true;
  }

  static '13-shoulder-to-shoulder'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 2;
      (target as IHero).will = (target as IHero).will + 2;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  static '21-spear-throw'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost + 1;
    }
  }

  static '23-defender'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isImmuneToDebuffs = true;
    target.regeneration = target.regeneration + 1;
  }

  static '32-no-step-back'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 3;
    target.isImmuneToDebuffs = true;
  }

  static '42-breakthrough'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  static '43-rallying'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 4;
      (target as IHero).intellect = (target as IHero).intellect + 4;
      (target as IHero).armor = (target as IHero).armor + 4;
      (target as IHero).will = (target as IHero).will + 4;
    }
  }

  // Highlander
  static '11-heavy-strike'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 1;
    }
  }

  static '12-strong-grip'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 2;
      (target as IHero).will = (target as IHero).will + 1;
      target.isImmuneToDisarm = true;
    }
  }

  static '22-freedom-spirit'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  static '31-halving'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  static '32-thunderer'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  static '42-ancestral-power'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength + 3;
      (target as IHero).intellect = (target as IHero).intellect + 3;
      (target as IHero).extraWeaponEnergyCost = (target as IHero).extraWeaponEnergyCost - 1;
    }
  }

  // Druid
  static '11-crown-of-thorns'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (isBeforeTurn && !target.isPet) {
      CharHelper.spendMana(target as IHero, 3);
    }
  }

  static '13-wound-healing'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.regeneration = target.regeneration + 2;
    if (!target.isPet) {
      (target as IHero).mind = (target as IHero).mind + 2;
    }
  }

  static '21-entangling-roots'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    target.isImmobilized = true;
  }

  static '23-breath-of-life'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
    }
  }

  static '31-choking-vine'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isSilenced = true;
  }

  static '33-power-of-the-pack'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor + 4;
      (target as IHero).will = (target as IHero).will + 4;
      (target as IHero).mind = (target as IHero).mind + 4;
    } else {
      target.regeneration = target.regeneration + 4;
    }
  }

  static '43-symbiosis'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      const caster: IHero = CharHelper.getHeroById(effect.casterId, heroes);
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

      if (caster.regeneration > target.regeneration) {
        target.regeneration = caster.regeneration;
      } else {
        caster.regeneration = target.regeneration;
      }
    }
  }

  // Oracle
  static '23-paranoia'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will - 1;
      (target as IHero).mind = (target as IHero).mind - 1;
    }
  }

  static '33-mind-control'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  static '43-amnesia'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).maxAllowedAbilityLevel = 1;
    }
  }

  // Avatar
  static '22-cauterization'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).will = (target as IHero).will + 1;
    }
  }

  static '23-scorch'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
  }

  static '31-dragon-tail'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  static '32-elements-control'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    (target as IHero).armor = (target as IHero).armor + 3;
    (target as IHero).will = (target as IHero).will + 3;
    (target as IHero).mind = (target as IHero).mind + 3;
  }

  static '41-harmony'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
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
  static '13-debilitating-shot'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    if (!target.isPet) {
      (target as IHero).strength = (target as IHero).strength - 1;
      (target as IHero).intellect = (target as IHero).intellect - 1;
    }
  }

  static '23-blind'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isBlind = true;
  }

  static '32-shadow-cloak'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).isInvisible = true;
  }

  // Lightbringer
  static '21-aura-of-might'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      let extraStat = 2;
      const caster: IHero = CharHelper.getHeroById(effect.casterId, heroes);
      if (CharHelper.getCharEffectById(caster, '42-divine-radiance')) {
        extraStat = 4;
      }
      (target as IHero).strength = (target as IHero).strength + extraStat;
      (target as IHero).intellect = (target as IHero).intellect + extraStat;
    }
  }

  static '22-aura-of-fortitude'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    if (!target.isPet) {
      let extraStat = 2;
      const caster: IHero = CharHelper.getHeroById(effect.casterId, heroes);
      if (CharHelper.getCharEffectById(caster, '42-divine-radiance')) {
        extraStat = 4;
      }
      (target as IHero).armor = (target as IHero).armor + extraStat;
      (target as IHero).will = (target as IHero).will + extraStat;
    }
  }

  static '23-aura-of-light'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    let extraIntellect = 1;
    let extraRegeneration = 1;
    let extraMind = 2;
    const caster: IHero = CharHelper.getHeroById(effect.casterId, heroes);
    if (CharHelper.getCharEffectById(caster, '42-divine-radiance')) {
      extraIntellect = 2;
      extraRegeneration = 2;
      extraMind = 4;
    }
    if (!target.isPet) {
      (target as IHero).intellect = (target as IHero).intellect + extraIntellect;
      (target as IHero).mind = (target as IHero).mind + extraMind;
    }
    target.regeneration = target.regeneration + extraRegeneration;
  }

  static '41-hammer-of-wrath'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isStunned = true;
  }

  // Avenger
  static '23-temporal-strike'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.isDisarmed = true;
    if (!target.isPet) {
      (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost + 1;
    }
  }

  static '32-sand-storm-blind'(
    battle: IBattle,
    heroes: IHero[],
    effect: IEffect,
    target: IChar,
    isBeforeTurn: boolean
  ) {
    target.isBlind = true;
  }

  static '41-excellence'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 2;
    (target as IHero).intellect = (target as IHero).intellect + 2;
  }

  static '42-sand-form'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).isInvisible = true;
    (target as IHero).regeneration = (target as IHero).regeneration + 1;
  }

  // Navarch
  static '12-swift-reflexes'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).moveEnergyCost = (target as IHero).moveEnergyCost - 1;
    (target as IHero).armor = (target as IHero).armor + 1;
    (target as IHero).will = (target as IHero).will + 1;
  }

  static '22-smoke-cloud'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).isInvisible = true;
    (target as IHero).mind = (target as IHero).mind + 1;
  }

  static '31-skillful-trick'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    if (!target.isPet) {
      (target as IHero).armor = (target as IHero).armor - 2;
    }
    target.isDisarmed = true;
  }

  static '32-shellback'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    target.regeneration = target.regeneration + 2;
    if (!target.isPet) {
      (target as IHero).mind = (target as IHero).mind + 2;
    }
  }

  static '41-fortune'(battle: IBattle, heroes: IHero[], effect: IEffect, target: IChar, isBeforeTurn: boolean) {
    (target as IHero).strength = (target as IHero).strength + 4;
  }
}
