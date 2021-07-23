import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as rfdc from 'rfdc';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IEquip } from 'src/interfaces/IEquip';
import { IHero } from 'src/interfaces/IHero';
import { IHeroData } from 'src/interfaces/IHeroData';
import { IPet } from 'src/interfaces/IPet';
import { IPosition } from 'src/interfaces/IPosition';
import { ITeam } from 'src/interfaces/ITeam';
import { Const } from 'src/static/const';
import { Helper } from 'src/static/helper';
import { HeroesData } from 'src/static/heroes-data';

@Injectable()
export class HeroService {
  constructor() {}

  spendEnergy(hero: IHero, value: number) {
    if (hero.energy - value > 0) {
      hero.energy -= value;
    } else {
      hero.energy = 0;
    }
  }

  spendMana(hero: IHero, value: number) {
    if (hero.mana - value > 0) {
      hero.mana -= value;
    } else {
      hero.mana = 0;
    }
  }

  takeEnergy(hero: IHero, value: number) {
    if (hero.energy + value <= hero.maxEnergy) {
      hero.energy = hero.energy + value;
    } else {
      hero.energy = hero.maxEnergy;
    }
  }

  takeMana(hero: IHero, value: number) {
    if (hero.mana + value <= hero.maxMana) {
      hero.mana = hero.mana + value;
    } else {
      hero.mana = hero.maxMana;
    }
  }

  setRandomHeroes(teamSetup) {
    const availableHeroes = [...Const.moveOrder];
    const randomHeroes = [];
    for (let i = 0; i < teamSetup.length; i++) {
      for (let j = 0; j < teamSetup[i].length; j++) {
        const heroName = teamSetup[i][j].hero;
        if (heroName === 'random') {
          randomHeroes.push(teamSetup[i][j]);
        } else {
          availableHeroes.splice(availableHeroes.indexOf(heroName), 1);
        }
      }
    }
    while (randomHeroes.length > 0) {
      const randomHeroIndex = Helper.randomInt(0, availableHeroes.length - 1);
      randomHeroes[0].hero = availableHeroes[randomHeroIndex];
      availableHeroes.splice(randomHeroIndex, 1);
      randomHeroes.splice(0, 1);
    }
  }

  canMove(char: IChar, isPet?: boolean): boolean {
    if (isPet) {
      return !(char as IPet).isMoved && !char.isImmobilized;
    } else {
      return (char as IHero).energy - (char as IHero).moveEnergyCost >= 0 && !char.isImmobilized;
    }
  }

  canUseWeapon(hero: IHero, weapon: IEquip): boolean {
    return (
      hero.energy - weapon.energyCost >= 0 &&
      (!hero.isDisarmed || hero.isImmuneToDisarm) &&
      !weapon.isUsed &&
      !weapon.isPassive
    );
  }

  getHeroById(heroId: string, heroes: IHero[]): IHero {
    return heroes.find((hero: IHero) => {
      return hero.id === heroId;
    });
  }

  getCharById(charId: string, heroes: IHero[]): IChar {
    for (let i = 0; i < heroes.length; i++) {
      if (heroes[i].id === charId) {
        return heroes[i];
      }
      for (let j = 0; j < heroes[i].pets.length; j++) {
        if (heroes[i].pets[j].id === charId) {
          return heroes[i].pets[j];
        }
      }
    }
    return undefined;
  }

  getTeamIdByHeroId(heroId: string, teams: ITeam[]): string {
    return teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === heroId;
      });
    }).id;
  }

  getTeamByHeroId(heroId: string, teams: ITeam[]): ITeam {
    return teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === heroId;
      });
    });
  }

  getHeroAbilityById(hero: IHero, abilityId: string) {
    for (let i = 0; i < hero.abilities.length; i++) {
      if (hero.abilities[i].id === abilityId) {
        return hero.abilities[i];
      }
    }
  }

  getCharEffectById(char: IChar, effectId: string) {
    for (let i = 0; i < char.effects.length; i++) {
      if (char.effects[i].id === effectId) {
        return char.effects[i];
      }
    }
  }

  getHeroData(heroId: string): IHeroData {
    return rfdc({ proto: true })(HeroesData[heroId]);
  }

  calcHero(hero: IHero): IHero {
    hero.strength =
      hero.primaryWeapon.strength +
      (hero.secondaryWeapon ? hero.secondaryWeapon.strength : 0) +
      hero.chestpiece.strength;
    if (hero.strength < 0) {
      hero.strength = 0;
    }
    if (hero.strength > Const.maxPrimaryAttributes) {
      hero.strength = Const.maxPrimaryAttributes;
    }

    hero.intellect =
      hero.primaryWeapon.intellect +
      (hero.secondaryWeapon ? hero.secondaryWeapon.intellect : 0) +
      hero.chestpiece.intellect;
    if (hero.intellect < 0) {
      hero.intellect = 0;
    }
    if (hero.intellect > Const.maxPrimaryAttributes) {
      hero.intellect = Const.maxPrimaryAttributes;
    }

    hero.armor =
      hero.primaryWeapon.armor + (hero.secondaryWeapon ? hero.secondaryWeapon.armor : 0) + hero.chestpiece.armor;
    if (hero.armor < 0) {
      hero.armor = 0;
    }
    if (hero.armor > Const.maxPrimaryAttributes) {
      hero.armor = Const.maxPrimaryAttributes;
    }

    hero.will = hero.primaryWeapon.will + (hero.secondaryWeapon ? hero.secondaryWeapon.will : 0) + hero.chestpiece.will;
    if (hero.will < 0) {
      hero.will = 0;
    }
    if (hero.will > Const.maxPrimaryAttributes) {
      hero.will = Const.maxPrimaryAttributes;
    }

    hero.regeneration =
      hero.primaryWeapon.regeneration +
      (hero.secondaryWeapon ? hero.secondaryWeapon.regeneration : 0) +
      hero.chestpiece.regeneration;
    if (hero.regeneration < 0) {
      hero.regeneration = 0;
    }
    if (hero.regeneration > Const.maxSecondaryAttributes) {
      hero.regeneration = Const.maxSecondaryAttributes;
    }

    hero.mind = hero.primaryWeapon.mind + (hero.secondaryWeapon ? hero.secondaryWeapon.mind : 0) + hero.chestpiece.mind;
    if (hero.mind < 0) {
      hero.mind = 0;
    }
    if (hero.mind > Const.maxSecondaryAttributes) {
      hero.mind = Const.maxSecondaryAttributes;
    }

    for (let i = 0; i < hero.pets.length; i++) {
      hero.pets[i].regeneration = 0;
    }

    return hero;
  }

  resetHeroState(hero: IHero): IHero {
    hero.moveEnergyCost = Const.moveEnergyCost;
    hero.isInvisible = false;
    hero.isSilenced = false;
    hero.isDisarmed = false;
    hero.isStunned = false;
    hero.isImmobilized = false;
    if (hero.id === 'avatar') {
      hero.isImmuneToDisarm = true;
    } else {
      hero.isImmuneToDisarm = false;
    }

    for (let i = 0; i < hero.pets.length; i++) {
      hero.pets[i].isMoved = false;
      hero.pets[i].isStunned = false;
    }

    return hero;
  }

  moveChar(battle: IBattle, activeChar: IChar, position: IPosition, isPet: boolean): IBattle {
    activeChar.position.x = position.x;
    activeChar.position.y = position.y;
    if (!isPet) {
      (activeChar as IHero).energy -= (activeChar as IHero).moveEnergyCost;
    } else {
      (activeChar as IPet).isMoved = true;
    }
    return battle;
  }

  upgradeEquip(battle: IBattle, heroes: IHero[], equipId: string): IBattle {
    let activeHero = this.getHeroById(battle.queue[0], heroes);
    const team = this.getTeamByHeroId(activeHero.id, battle.teams);
    if (team.crystals > 0 || activeHero.crystals > 0) {
      const heroData = this.getHeroData(activeHero.id);

      if (activeHero.primaryWeapon.id === equipId && activeHero.primaryWeapon.level < 3) {
        activeHero.primaryWeapon = heroData.primaryWeapons[activeHero.primaryWeapon.level];
        battle.log.push({
          type: LogMessageType.UPGRADE_EQUIP,
          id: activeHero.id,
          equipId: activeHero.primaryWeapon.id
        });
      } else if (activeHero.secondaryWeapon?.id === equipId && activeHero.secondaryWeapon?.level < 3) {
        activeHero.secondaryWeapon = heroData.secondaryWeapons[activeHero.secondaryWeapon.level];
        battle.log.push({
          type: LogMessageType.UPGRADE_EQUIP,
          id: activeHero.id,
          equipId: activeHero.secondaryWeapon.id
        });
      } else if (activeHero.chestpiece.id === equipId && activeHero.chestpiece.level < 3) {
        activeHero.chestpiece = heroData.chestpieces[activeHero.chestpiece.level];
        battle.log.push({
          type: LogMessageType.UPGRADE_EQUIP,
          id: activeHero.id,
          equipId: activeHero.chestpiece.id
        });
      } else {
        return battle;
      }

      activeHero = this.calcHero(activeHero);

      if (team.crystals > 0) {
        team.crystals -= 1;
      } else if (activeHero.crystals > 0) {
        activeHero.crystals -= 1;
      }
    }
    return battle;
  }

  learnAbility(battle: IBattle, heroes: IHero[], abilityId: string): IBattle {
    let activeHero = this.getHeroById(battle.queue[0], heroes);
    const team = this.getTeamByHeroId(activeHero.id, battle.teams);
    if (activeHero.abilities.length === 0 || team.crystals > 0 || activeHero.crystals > 0) {
      const heroData = this.getHeroData(activeHero.id);

      activeHero.abilities.push(heroData.abilities.find((a) => a.id === abilityId));
      battle.log.push({
        type: LogMessageType.LEARN_ABILITY,
        id: activeHero.id,
        abilityId: abilityId
      });

      if (activeHero.abilities.length > 1) {
        if (team.crystals > 0) {
          team.crystals -= 1;
        } else if (activeHero.crystals > 0) {
          activeHero.crystals -= 1;
        }
      }
    }
    return battle;
  }
}
