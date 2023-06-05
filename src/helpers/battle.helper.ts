import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IHero } from 'src/interfaces/IHero';
import { Const } from 'src/static/const';
import { ITeam } from 'src/interfaces/ITeam';
import * as _ from 'lodash';
import { IScenarioSetupDto } from 'src/dto/scenario-setup.dto';
import CharHelper from './char.helper';
import { IPosition } from 'src/interfaces/IPosition';
import MapHelper from './map.helper';
import { IAbility } from 'src/interfaces/IAbility';
import { AbilityTargetType } from 'src/enums/ability-target-type.enum';
import { IPet } from 'src/interfaces/IPet';
import { IEquip } from 'src/interfaces/IEquip';
import { IAction } from 'src/interfaces/IAction';
import { ActionType } from 'src/enums/action-type.enum';

export default class BattleHelper {
  static calculateWeaponDamage(
    weapon: IEquip,
    activeHero: IHero
  ): { physDamage: number; magicDamage: number; directDamage: number } {
    let physDamage = weapon.physDamage || 0;
    let magicDamage = weapon.magicDamage || 0;
    let directDamage = weapon.directDamage || 0;

    if (activeHero.id === 'highlander' && CharHelper.getHeroAbilityById(activeHero, '13-lightning-rod')) {
      magicDamage = magicDamage + 2;
    }

    if (activeHero.id === 'druid' && CharHelper.getHeroAbilityById(activeHero, '32-war-tree')) {
      physDamage = physDamage + 2;
      magicDamage = magicDamage + 2;
    }

    if (activeHero.id === 'avatar' && CharHelper.getHeroAbilityById(activeHero, '21-flame-claws')) {
      magicDamage = magicDamage + 1;
    }

    if (activeHero.id === 'lightbringer' && CharHelper.getCharEffectById(activeHero, '32-sun-aegis')) {
      magicDamage = magicDamage + 3;
    }

    if (
      activeHero.id === 'navarch' &&
      CharHelper.getHeroAbilityById(activeHero, '33-gunslinger') &&
      weapon.id.startsWith('gun')
    ) {
      directDamage = directDamage + 1;
    }

    return { physDamage, magicDamage, directDamage };
  }

  static checkAbilityForUse(ability: IAbility, caster: IChar): boolean {
    if (caster.isStunned) {
      return false;
    }

    if (ability.isPassive) {
      return false;
    }

    if (ability.needWeapon && !caster.isImmuneToDisarm && caster.isDisarmed) {
      return false;
    }

    if (ability.isSpell && caster.isSilenced) {
      return false;
    }

    if (ability.targetType === AbilityTargetType.MOVE && caster.isImmobilized) {
      return false;
    }

    if (
      ability.targetType === AbilityTargetType.MAP &&
      !caster.isPet &&
      (caster as IHero).pets.find((pet) => pet.id === ability.id.split('-').splice(1).join('-'))
    ) {
      return false;
    }

    if (caster.isPet) {
      return ability.left === 0;
    } else {
      switch (ability.id) {
        case '32-elements-control':
          if (CharHelper.getCharEffectById(caster, '32-elements-control')) {
            return false;
          }
          break;
        case '31-assault':
        case '43-rallying':
        case '12-flame-dash':
        case '21-boarding':
          if (caster.isImmobilized) {
            return false;
          }
          break;
        case '41-fortune':
          if (CharHelper.getCharEffectById(caster, '41-fortune')) {
            return false;
          }
          break;
      }
      return (
        ability.level <= (caster as IHero).maxAllowedAbilityLevel &&
        ability.left === 0 &&
        (caster as IHero).energy - ability.energyCost >= 0 &&
        (caster as IHero).mana - ability.manaCost >= 0
      );
    }
  }

  static checkAbilityAction(
    battle: IBattle,
    heroes: IHero[],
    ability: IAbility,
    caster: IChar,
    targetId: string,
    position?: IPosition
  ): boolean {
    let target: IChar;
    position; //not used for current abilities set

    switch (ability.id) {
      // Paragon
      case '11-sunder-armor':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '12-shield-bash':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).secondaryWeapon.level + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '13-shoulder-to-shoulder':
        target = CharHelper.getCharById(targetId, heroes);
        return !target.isPet;
      case '21-spear-throw':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '33-bandaging':
        target = CharHelper.getCharById(targetId, heroes);
        return target.health < target.maxHealth;
      case '41-piercing-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '42-breakthrough':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).secondaryWeapon.level + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Highlander
      case '21-sweeping-strike':
        const sweepingStrikeEnemies = this.findEnemies(battle, caster.id, 2, true, '21-sweeping-strike', false, false);
        for (let i = 0; i < sweepingStrikeEnemies.length; i++) {
          const sweepingStrikeTarget = CharHelper.getCharById(sweepingStrikeEnemies[i], heroes);
          if (sweepingStrikeTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              (caster as IHero).strength -
              (sweepingStrikeTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '31-halving':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '32-thunderer':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 1 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '33-lightning-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '41-decapitation':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '42-ancestral-power':
        target = CharHelper.getCharById(targetId, heroes);
        return !target.isPet;
      case '43-chain-lightning':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        }

        const chainLightningAoeEnemies = this.findEnemies(
          battle,
          caster.id,
          2,
          true,
          ability.id,
          false,
          false,
          target.position
        );
        for (let i = 0; i < chainLightningAoeEnemies.length; i++) {
          if (chainLightningAoeEnemies[i] !== targetId) {
            const chainLightningAoeTarget = CharHelper.getCharById(chainLightningAoeEnemies[i], heroes);
            if (chainLightningAoeTarget.isPet) {
              return true;
            } else {
              const magicDamageToHealth = 4 + (caster as IHero).intellect - (chainLightningAoeTarget as IHero).will;
              if (magicDamageToHealth > 0) {
                return true;
              }
            }
          }
        }
        const chainLightningDamageToHealth = 5 + (caster as IHero).intellect - (target as IHero).will;
        if (chainLightningDamageToHealth > 0) {
          return true;
        }
        return false;

      // Druid
      case '11-crown-of-thorns':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 3 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '12-poison-touch':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '21-entangling-roots':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '22-wolf-bite':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 5;

          if (CharHelper.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 4;
          }
          const physDamageToHealth = abilityDamage - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '31-choking-vine':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '41-wrath-of-nature':
        const wrathOfNatureEnemies = this.findEnemies(battle, caster.id, 3, true, '41-wrath-of-nature', false, false);
        return wrathOfNatureEnemies.length > 0;
      case '42-dryad-forest-wrath':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 7;

          if (CharHelper.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 4;
          }
          const magicDamageToHealth = abilityDamage - (target as IHero).will;
          return magicDamageToHealth > 0 || (target as IHero).mana > 0;
        }

      // Oracle
      case '13-dangerous-knowledge':
        return (caster as IHero).intellect > 0;
      case '21-mind-blow':
        target = CharHelper.getCharById(targetId, heroes);
        let leftCounter = 0;

        if (target.isPet) {
          leftCounter += (target as IPet).ability.left;
        } else {
          for (let i = 0; i < (target as IHero).abilities.length; i++) {
            leftCounter += (target as IHero).abilities[i].left;
          }
        }
        if (leftCounter > 0) {
          const magicDamageToHealth = leftCounter + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        } else {
          return false;
        }
      case '22-knowledge-steal':
        target = CharHelper.getCharById(targetId, heroes);
        return !!target.effects.find((e) => e.isBuff && e.isRemovable);
      case '23-paranoia':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-disruption':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth =
            Math.ceil((caster as IHero).mana / 2) + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '33-mind-control':
        target = CharHelper.getCharById(targetId, heroes);
        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '43-amnesia':
        target = CharHelper.getCharById(targetId, heroes);
        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 3 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Avatar
      case '11-furious-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 2 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '13-fireball':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 1 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '23-scorch':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-dragon-tail':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '33-meteor':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        }

        const meteorAoeEnemies = this.findEnemies(
          battle,
          caster.id,
          1,
          true,
          ability.id,
          false,
          false,
          target.position
        );
        for (let i = 0; i < meteorAoeEnemies.length; i++) {
          if (meteorAoeEnemies[i] !== targetId) {
            const meteorAoeTarget = CharHelper.getCharById(meteorAoeEnemies[i], heroes);
            if (meteorAoeTarget.isPet) {
              return true;
            } else {
              const magicDamageToHealth = 1 + (caster as IHero).intellect - (meteorAoeTarget as IHero).will;
              if (magicDamageToHealth > 0) {
                return true;
              }
            }
          }
        }
        const meteorDamageToHealth = 4 + (caster as IHero).intellect - (target as IHero).will;
        if (meteorDamageToHealth > 0) {
          return true;
        }
        return false;
      case '42-dragon-spirit-breath':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let abilityDamage = 6;

          if (CharHelper.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 4;
          }

          const aoeEnemies = this.findEnemies(battle, caster.id, 1, true, ability.id, false, false, target.position);

          for (let i = 0; i < aoeEnemies.length; i++) {
            if (aoeEnemies[i] !== target.id) {
              const aoeTarget = CharHelper.getCharById(aoeEnemies[i], heroes);
              if (aoeTarget.isPet) {
                return true;
              } else {
                const magicDamageToHealth = abilityDamage - (aoeTarget as IHero).will;
                if (magicDamageToHealth > 0) {
                  return true;
                }
              }
            }
          }

          const breathDamageToHealth = abilityDamage - (target as IHero).will;
          if (breathDamageToHealth > 0) {
            return true;
          }
          return false;
        }

      // Shadow
      case '11-aimed-shot':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '13-debilitating-shot':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '21-rapid-fire':
        return (
          (caster as IHero).primaryWeapon.isUsed &&
          (caster as IHero).energy >= (caster as IHero).primaryWeapon.energyCost
        );
      case '23-blind':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-volley':
        const volleyEnemies = this.findEnemies(battle, caster.id, 3, true, ability.id, false, false);
        for (let i = 0; i < volleyEnemies.length; i++) {
          const volleyTarget = CharHelper.getCharById(volleyEnemies[i], heroes);
          if (volleyTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              2 +
              (caster as IHero).strength -
              (volleyTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '41-headshot':
        target = CharHelper.getCharById(targetId, heroes);
        return target.health < 10;
      case '42-phantom-imitation-shot':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const shadow = CharHelper.getHeroById('shadow', heroes);

          let abilityDamage = shadow.primaryWeapon.physDamage + shadow.strength;

          if (CharHelper.getCharEffectById(caster, '33-power-of-the-pack')) {
            abilityDamage += 4;
          }
          const physDamageToHealth = abilityDamage - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '43-oblivion':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 5 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }

      // Lightbringer
      case '11-sun-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '13-sun-touch':
        target = CharHelper.getCharById(targetId, heroes);
        const casterTeamForSunTouch = CharHelper.getTeamByHeroId(caster.id, battle.teams);
        const targetTeamForSunTouch = CharHelper.getTeamByCharId(target.id, battle.teams);
        if (casterTeamForSunTouch.id === targetTeamForSunTouch.id) {
          return target.health < target.maxHealth;
        } else {
          if (target.isPet) {
            return true;
          } else {
            const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
            return magicDamageToHealth > 0;
          }
        }
      case '31-retribution':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 1 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 1 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0;
        }
      case '33-cleansing':
        target = CharHelper.getCharById(targetId, heroes);
        const casterTeamForCleansing = CharHelper.getTeamByHeroId(caster.id, battle.teams);
        const targetTeamForCleansing = CharHelper.getTeamByCharId(target.id, battle.teams);
        if (casterTeamForCleansing.id === targetTeamForCleansing.id) {
          return !!target.effects.find((e) => !e.isBuff);
        } else {
          return !!target.effects.find((e) => e.isBuff);
        }
      case '41-hammer-of-wrath':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 2 + (caster as IHero).strength - (target as IHero).armor;
          const magicDamageToHealth = 2 + (caster as IHero).intellect - (target as IHero).will;
          return physDamageToHealth > 0 || magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '43-sunrise':
        if ((caster as IHero).intellect > 0) {
          const sunriseAllies = this.findAllies(battle, caster.id, 3, true, true, true, false);
          for (let i = 0; i < sunriseAllies.length; i++) {
            const sunriseAlly = CharHelper.getCharById(sunriseAllies[i], heroes);
            if (sunriseAlly.health < sunriseAlly.maxHealth) {
              return true;
            }
          }
        }
        return false;

      // Avenger
      case '11-double-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).strength -
            (target as IHero).armor;
          return physDamageToHealth > 0;
        }
      case '12-desert-revenge':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).intellect -
            (target as IHero).will;
          return magicDamageToHealth > 0;
        }
      case '13-fit-of-energy':
        return (
          (caster as IHero).energy <= (caster as IHero).maxEnergy - 2 ||
          (caster as IHero).mana <= (caster as IHero).maxMana - 2 ||
          (caster as IHero).health <= (caster as IHero).maxHealth - 2
        );
      case '21-precise-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          let targetArmor = (target as IHero).armor - (caster as IHero).intellect;
          if (targetArmor < 0) {
            targetArmor = 0;
          }
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).strength -
            targetArmor;
          return physDamageToHealth > 0;
        }
      case '22-quicksands':
        target = CharHelper.getCharById(targetId, heroes);
        return !target.isImmuneToDebuffs;
      case '23-temporal-strike':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage +
            (caster as IHero).secondaryWeapon.physDamage +
            (caster as IHero).strength -
            (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '31-blade-storm':
        const bladeStormEnemies = this.findEnemies(battle, caster.id, 1, true, ability.id, false, false);
        for (let i = 0; i < bladeStormEnemies.length; i++) {
          const bladeStormTarget = CharHelper.getCharById(bladeStormEnemies[i], heroes);
          if (bladeStormTarget.isPet) {
            return true;
          } else {
            const physDamageToHealth =
              (caster as IHero).primaryWeapon.physDamage +
              (caster as IHero).secondaryWeapon.physDamage +
              2 +
              (caster as IHero).strength -
              (bladeStormTarget as IHero).armor;
            if (physDamageToHealth > 0) {
              return true;
            }
          }
        }
        return false;
      case '33-time-trap':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const magicDamageToHealth = 3 + (caster as IHero).intellect - (target as IHero).will;
          return magicDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '43-sands-of-time':
        return (
          (caster as IHero).energy < (caster as IHero).maxEnergy ||
          (caster as IHero).mana < (caster as IHero).maxMana ||
          (caster as IHero).primaryWeapon.isUsed ||
          (caster as IHero).secondaryWeapon.isUsed
        );

      // Navarch
      case '13-reload':
        return (
          (caster as IHero).secondaryWeapon.isUsed &&
          (caster as IHero).energy >= (caster as IHero).secondaryWeapon.energyCost
        );
      case '31-skillful-trick':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '32-shellback':
        return (
          (caster as IHero).energy <= (caster as IHero).maxEnergy - 4 ||
          (caster as IHero).mana <= (caster as IHero).maxMana ||
          (caster as IHero).health <= (caster as IHero).maxHealth
        );
      case '41-fortune':
        target = CharHelper.getCharById(targetId, heroes);

        if (target.isPet) {
          return true;
        } else {
          const physDamageToHealth =
            (caster as IHero).primaryWeapon.physDamage + 3 + (caster as IHero).strength - (target as IHero).armor;
          return physDamageToHealth > 0 || !target.isImmuneToDebuffs;
        }
      case '42-bomb-toss':
        const bombAoeEnemies = this.findEnemies(battle, caster.id, 1, true, ability.id, false, false, position);
        return bombAoeEnemies.length > 0;

      // Default
      default:
        return true;
    }
  }

  static findAllies(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeSelf: boolean,
    includeInvisible: boolean,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = CharHelper.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }

    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = MapHelper.findNearestPoints(
      sourcePositionPoint,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleAllies = this.getPossibleAllies(battle, sourceCharId, includeSelf);

    const allies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleAllies.length; j++) {
        if (
          points[i].x === possibleAllies[j].position.x &&
          points[i].y === possibleAllies[j].position.y &&
          (includeInvisible || !(possibleAllies[j] as IHero).isInvisible) &&
          !(possibleAllies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !MapHelper.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
        ) {
          allies.push(possibleAllies[j].id);
        }
      }
    }
    return allies;
  }

  static findEnemies(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeInvisible: boolean,
    abilityId: string,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar: IChar = CharHelper.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }
    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = MapHelper.findNearestPoints(
      sourcePositionPoint,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleEnemies = this.getPossibleEnemies(battle, sourceCharId);

    const enemies: string[] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleEnemies.length; j++) {
        if (
          points[i].x === possibleEnemies[j].position.x &&
          points[i].y === possibleEnemies[j].position.y &&
          (includeInvisible || !(possibleEnemies[j] as IHero).isInvisible) &&
          !(abilityId === '41-headshot' && possibleEnemies[j].health >= 10) &&
          !(possibleEnemies[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !MapHelper.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
        ) {
          enemies.push(possibleEnemies[j].id);
        }
      }
    }
    return enemies;
  }

  static findHeroes(
    battle: IBattle,
    sourceCharId: string,
    radius: number,
    includeSelf: boolean,
    includeInvisible: boolean,
    ignoreRaytrace: boolean,
    blindCheck: boolean,
    sourcePosition?: IPosition
  ): string[] {
    const heroes = this.getHeroesInBattle(battle);
    const sourceChar = CharHelper.getCharById(sourceCharId, heroes);
    if (!sourceChar) {
      return [];
    }

    const sourcePositionPoint = sourcePosition || sourceChar.position;

    const points = MapHelper.findNearestPoints(
      sourcePosition || sourceChar.position,
      battle.scenario.tiles,
      blindCheck && sourceChar.isBlind ? 1 : radius
    );
    const possibleChars: IChar[] = [];

    for (let i = 0; i < heroes.length; i++) {
      if (heroes[i].id === sourceCharId) {
        if (includeSelf) {
          possibleChars.push(heroes[i]);
        }
      } else {
        possibleChars.push(heroes[i]);
      }
      possibleChars.push(...heroes[i].pets);
    }

    const chars: string[] = [];
    const sourceCharTeamId = CharHelper.getTeamByCharId(sourceCharId, battle.teams).id;

    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < possibleChars.length; j++) {
        const possibleCharTeamId = CharHelper.getTeamByCharId(possibleChars[j].id, battle.teams).id;
        if (
          points[i].x === possibleChars[j].position.x &&
          points[i].y === possibleChars[j].position.y &&
          ((includeInvisible && sourceCharTeamId === possibleCharTeamId) || !(possibleChars[j] as IHero).isInvisible) &&
          !(possibleChars[j] as IHero).isDead &&
          (ignoreRaytrace ||
            !MapHelper.rayTrace(
              { x: sourcePositionPoint.x, y: sourcePositionPoint.y },
              { x: points[i].x, y: points[i].y },
              battle.scenario.tiles,
              heroes
            ))
        ) {
          chars.push(possibleChars[j].id);
        }
      }
    }
    return chars;
  }

  static getAvailableActions(battle: IBattle, previousMoves: IPosition[]): IAction[] {
    const heroes = this.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    if (!activeHero) {
      return [{ t: ActionType.TURN_END }];
    }
    const team = CharHelper.getTeamByHeroId(activeHero.id, battle.teams);
    const actions: IAction[] = [];

    if (activeHero.abilities.length === 0) {
      const heroData = CharHelper.getHeroData(activeHero.id);
      for (let i = 0; i < 3; i++) {
        actions.push({
          t: ActionType.LEARN_ABILITY,
          a: heroData.abilities[i].id
        });
      }
      return actions;
    }

    if (team.crystals > 0 || activeHero.crystals > 0) {
      const heroData = CharHelper.getHeroData(activeHero.id);

      const heroAbilityLevel = activeHero.abilities.length;
      for (let i = 3 * heroAbilityLevel; i < 3 * heroAbilityLevel + 3; i++) {
        if (heroData.abilities[i]) {
          if (heroData.abilities[i].targetType === AbilityTargetType.ALLY_NOT_ME && team.heroes.length < 2) {
            continue;
          }
          actions.push({
            t: ActionType.LEARN_ABILITY,
            a: heroData.abilities[i].id
          });
        }
      }

      if (
        activeHero.primaryWeapon.level < 3 &&
        (team.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost ||
          activeHero.crystals >= heroData.primaryWeapons[activeHero.primaryWeapon.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.primaryWeapon.id
        });
      }
      if (
        activeHero.secondaryWeapon &&
        activeHero.secondaryWeapon.level < 3 &&
        (team.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost ||
          activeHero.crystals >= heroData.secondaryWeapons[activeHero.secondaryWeapon.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.secondaryWeapon.id
        });
      }
      if (
        activeHero.chestpiece.level < 3 &&
        (team.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost ||
          activeHero.crystals >= heroData.chestpieces[activeHero.chestpiece.level].cost)
      ) {
        actions.push({
          t: ActionType.UPGRADE_EQUIP,
          e: activeHero.chestpiece.id
        });
      }
    }

    for (let i = 0; i < activeHero.abilities.length; i++) {
      if (this.checkAbilityForUse(activeHero.abilities[i], activeHero)) {
        const ability = activeHero.abilities[i];
        switch (ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(
              battle,
              activeHero.id,
              ability.range,
              ability.includeInvisible,
              ability.id,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, enemies[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: enemies[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY:
            const allies = this.findAllies(
              battle,
              activeHero.id,
              ability.range,
              true,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allies[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allies[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_NOT_ME:
            const alliesWithoutMe = this.findAllies(
              battle,
              activeHero.id,
              ability.range,
              false,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < alliesWithoutMe.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, alliesWithoutMe[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: alliesWithoutMe[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY:
            const allHeroes = this.findHeroes(
              battle,
              activeHero.id,
              ability.range,
              true,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allHeroes.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allHeroes[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allHeroes[j]
                });
              }
            }
            break;
          case AbilityTargetType.ALLY_OR_ENEMY_NOT_ME:
            const allHeroesWithoutMe = this.findHeroes(
              battle,
              activeHero.id,
              ability.range,
              false,
              ability.includeInvisible,
              ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < allHeroesWithoutMe.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, allHeroesWithoutMe[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  tr: allHeroesWithoutMe[j]
                });
              }
            }
            break;
          case AbilityTargetType.SELF:
            if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id)) {
              actions.push({
                t: ActionType.ABILITY,
                a: ability.id,
                c: activeHero.id,
                tr: activeHero.id
              });
            }
            break;
          case AbilityTargetType.MOVE:
            const movePoints = MapHelper.getMovePoints(
              activeHero.position,
              activeHero.isBlind ? 1 : ability.range,
              battle.scenario.tiles,
              heroes,
              ability.ignoreRaytrace,
              ability.ignoreObstacles
            );
            for (let j = 0; j < movePoints.length; j++) {
              if (
                previousMoves.length &&
                previousMoves.find((move) => move.x === movePoints[j].x && move.y === movePoints[j].y)
              ) {
                continue;
              }
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id, movePoints[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  x: movePoints[j].x,
                  y: movePoints[j].y
                });
              }
            }
            break;
          case AbilityTargetType.MAP:
            const mapPoints = MapHelper.getMovePoints(
              activeHero.position,
              activeHero.isBlind ? 1 : ability.range,
              battle.scenario.tiles,
              heroes,
              ability.ignoreRaytrace,
              ability.ignoreObstacles
            );
            for (let j = 0; j < mapPoints.length; j++) {
              if (this.checkAbilityAction(battle, heroes, ability, activeHero, activeHero.id, mapPoints[j])) {
                actions.push({
                  t: ActionType.ABILITY,
                  a: ability.id,
                  c: activeHero.id,
                  x: mapPoints[j].x,
                  y: mapPoints[j].y
                });
              }
            }
            break;
        }
      }
    }

    for (let i = 0; i < activeHero.pets.length; i++) {
      if (activeHero.pets[i].isStunned) {
        continue;
      }
      if (this.checkAbilityForUse(activeHero.pets[i].ability, activeHero.pets[i])) {
        switch (activeHero.pets[i].ability.targetType) {
          case AbilityTargetType.ENEMY:
            const enemies = this.findEnemies(
              battle,
              activeHero.pets[i].id,
              activeHero.pets[i].ability.range,
              activeHero.pets[i].ability.includeInvisible,
              activeHero.pets[i].ability.id,
              activeHero.pets[i].ability.ignoreRaytrace,
              true
            );
            for (let j = 0; j < enemies.length; j++) {
              if (this.checkAbilityAction(battle, heroes, activeHero.pets[i].ability, activeHero.pets[i], enemies[j])) {
                actions.push({
                  t: ActionType.PET_ABILITY,
                  a: activeHero.pets[i].ability.id,
                  c: activeHero.pets[i].id,
                  tr: enemies[j]
                });
              }
            }
            break;
        }
      }
      if (!activeHero.pets[i].isMoved && !activeHero.pets[i].isImmobilized) {
        const petMovePoints = MapHelper.getMovePoints(activeHero.pets[i].position, 1, battle.scenario.tiles, heroes);
        for (let j = 0; j < petMovePoints.length; j++) {
          actions.push({
            t: ActionType.PET_MOVE,
            c: activeHero.pets[i].id,
            x: petMovePoints[j].x,
            y: petMovePoints[j].y
          });
        }
      }
    }

    if (CharHelper.canUseWeapon(activeHero, activeHero.primaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.primaryWeapon.range, false, '', false, true);
      for (let i = 0; i < enemies.length; i++) {
        const target = CharHelper.getCharById(enemies[i], heroes);
        let shouldBeAdded = false;

        if (target.isPet) {
          shouldBeAdded = true;
        } else {
          const { physDamage, magicDamage, directDamage } = this.calculateWeaponDamage(
            activeHero.primaryWeapon,
            activeHero
          );
          const physDamageToHealth = physDamage + activeHero.strength - (target as IHero).armor;
          const magicDamageToHealth = magicDamage + activeHero.intellect - (target as IHero).will;
          shouldBeAdded = physDamageToHealth > 0 || magicDamageToHealth > 0 || directDamage > 0;
        }

        if (shouldBeAdded) {
          actions.push({
            t: ActionType.WEAPON_DAMAGE,
            e: activeHero.primaryWeapon.id,
            c: activeHero.id,
            tr: enemies[i]
          });
        }
      }
    }
    if (activeHero.secondaryWeapon && CharHelper.canUseWeapon(activeHero, activeHero.secondaryWeapon)) {
      const enemies = this.findEnemies(battle, activeHero.id, activeHero.secondaryWeapon.range, false, '', false, true);
      for (let i = 0; i < enemies.length; i++) {
        const target = CharHelper.getCharById(enemies[i], heroes);
        let shouldBeAdded = false;

        if (target.isPet) {
          shouldBeAdded = true;
        } else {
          const { physDamage, magicDamage, directDamage } = this.calculateWeaponDamage(
            activeHero.secondaryWeapon,
            activeHero
          );
          const physDamageToHealth = physDamage + activeHero.strength - (target as IHero).armor;
          const magicDamageToHealth = magicDamage + activeHero.intellect - (target as IHero).will;
          shouldBeAdded = physDamageToHealth > 0 || magicDamageToHealth > 0 || directDamage > 0;
        }

        if (shouldBeAdded) {
          actions.push({
            t: ActionType.WEAPON_DAMAGE,
            e: activeHero.secondaryWeapon.id,
            c: activeHero.id,
            tr: enemies[i]
          });
        }
      }
    }

    const moves = this.getMovePoints(battle);
    for (let i = 0; i < moves.length; i++) {
      if (previousMoves.length && previousMoves.find((move) => move.x === moves[i].x && move.y === moves[i].y)) {
        continue;
      }
      actions.push({
        t: ActionType.MOVE,
        x: moves[i].x,
        y: moves[i].y
      });
    }

    if (
      actions.length === 0 ||
      activeHero.energy === 0 ||
      (team.crystals > 0 && team.heroes.filter((h) => !h.isDead).length > 1) ||
      activeHero.effects.find((e) => e.id === '33-mind-control')
    ) {
      actions.push({ t: ActionType.TURN_END });
    }

    return actions;
  }

  static getHeroesInBattle(battle: IBattle): IHero[] {
    const heroes = [];
    for (let i = 0; i < battle.teams.length; i++) {
      for (let j = 0; j < battle.teams[i].heroes.length; j++) {
        heroes.push(battle.teams[i].heroes[j]);
      }
    }
    return heroes;
  }

  static getMovePoints(battle: IBattle, petId?: string): IPosition[] {
    const heroes = this.getHeroesInBattle(battle);
    let char: IChar;
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    if (petId) {
      char = activeHero.pets.find((p) => p.id === petId);
    } else {
      char = CharHelper.getHeroById(battle.queue[0], heroes);
    }

    let movePoints: IPosition[] = [];
    if (CharHelper.canMove(char, !!petId)) {
      movePoints = MapHelper.getMovePoints(char.position, 1, battle.scenario.tiles, heroes);
    }
    return movePoints;
  }

  static getPossibleAllies(battle: IBattle, sourceCharId: string, includeSelf: boolean): IChar[] {
    const possibleAllies: IChar[] = [];
    let allyHeroes: IHero[] = [];
    allyHeroes = battle.teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === sourceCharId || hero.pets.find((p) => p.id === sourceCharId);
      });
    }).heroes;

    for (let i = 0; i < allyHeroes.length; i++) {
      if (allyHeroes[i].id === sourceCharId) {
        if (includeSelf) {
          possibleAllies.push(allyHeroes[i]);
        }
      } else {
        possibleAllies.push(allyHeroes[i]);
      }
      for (let j = 0; j < allyHeroes[i].pets.length; j++) {
        if (allyHeroes[i].pets[j].id === sourceCharId) {
          if (includeSelf) {
            possibleAllies.push(allyHeroes[i].pets[j]);
          }
        } else {
          possibleAllies.push(allyHeroes[i].pets[j]);
        }
      }
    }
    return possibleAllies;
  }

  static getPossibleEnemies(battle: IBattle, sourceCharId: string): IChar[] {
    const possibleEnemies: IChar[] = [];

    const enemyTeams = battle.teams.filter((team: ITeam) => {
      return !team.heroes.find((hero: IHero) => {
        return hero.id === sourceCharId || hero.pets.find((p) => p.id === sourceCharId);
      });
    });

    for (let i = 0; i < enemyTeams.length; i++) {
      for (let j = 0; j < enemyTeams[i].heroes.length; j++) {
        possibleEnemies.push(enemyTeams[i].heroes[j]);
        possibleEnemies.push(...enemyTeams[i].heroes[j].pets);
      }
    }

    return possibleEnemies;
  }

  static getQueue(teams: ITeam[]): string[] {
    const heroes = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams[i].heroes.length; j++) {
        heroes.push(teams[i].heroes[j].id);
      }
    }
    return _.intersection(Const.moveOrder, heroes);
  }

  static getScenarios(): IScenarioSetupDto[] {
    const scenarios = Const.scenarios.map((sc) => {
      return {
        id: sc.id,
        teamSize: sc.teamSize
      };
    });
    return scenarios;
  }
}
