import { Injectable } from '@nestjs/common';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IAbility } from 'src/interfaces/IAbility';
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
      hero.energy - (weapon.energyCost + hero.extraWeaponEnergyCost) >= 0 &&
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

  getTeamByHeroId(heroId: string, teams: ITeam[]): ITeam {
    return teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === heroId;
      });
    });
  }

  getTeamByCharId(charId: string, teams: ITeam[]): ITeam {
    return teams.find((team: ITeam) => {
      return team.heroes.find((hero: IHero) => {
        return hero.id === charId || hero.pets.find((p) => p.id === charId);
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
    const primaryWeapons: IEquip[] = [];
    for (let i = 0; i < HeroesData[heroId].primaryWeapons.length; i++) {
      primaryWeapons.push(Object.assign({}, HeroesData[heroId].primaryWeapons[i]));
    }

    const chestpieces: IEquip[] = [];
    for (let i = 0; i < HeroesData[heroId].chestpieces.length; i++) {
      chestpieces.push(Object.assign({}, HeroesData[heroId].chestpieces[i]));
    }

    const abilities: IAbility[] = [];
    for (let i = 0; i < HeroesData[heroId].abilities.length; i++) {
      abilities.push(Object.assign({}, HeroesData[heroId].abilities[i]));
    }

    const heroData: IHeroData = {
      id: HeroesData[heroId].id,
      maxEnergy: HeroesData[heroId].maxEnergy,
      maxHealth: HeroesData[heroId].maxHealth,
      maxMana: HeroesData[heroId].maxMana,

      primaryWeapons: primaryWeapons,
      chestpieces: chestpieces,

      abilities: abilities
    };

    if (HeroesData[heroId].secondaryWeapons) {
      const secondaryWeapons: IEquip[] = [];
      for (let i = 0; i < HeroesData[heroId].secondaryWeapons.length; i++) {
        secondaryWeapons.push(Object.assign({}, HeroesData[heroId].secondaryWeapons[i]));
      }
      heroData.secondaryWeapons = secondaryWeapons;
    }
    return heroData;
  }

  calcHero(hero: IHero): IHero {
    hero.strength =
      (hero.primaryWeapon.strength ? hero.primaryWeapon.strength : 0) +
      (hero.secondaryWeapon?.strength ? hero.secondaryWeapon.strength : 0) +
      (hero.chestpiece.strength ? hero.chestpiece.strength : 0);

    hero.intellect =
      (hero.primaryWeapon.intellect ? hero.primaryWeapon.intellect : 0) +
      (hero.secondaryWeapon?.intellect ? hero.secondaryWeapon.intellect : 0) +
      (hero.chestpiece.intellect ? hero.chestpiece.intellect : 0);

    hero.armor =
      (hero.primaryWeapon.armor ? hero.primaryWeapon.armor : 0) +
      (hero.secondaryWeapon?.armor ? hero.secondaryWeapon.armor : 0) +
      (hero.chestpiece.armor ? hero.chestpiece.armor : 0);
    if (hero.id === 'avatar' && this.getHeroAbilityById(hero, '21-flame-claws')) {
      hero.armor += 1;
    }

    hero.will =
      (hero.primaryWeapon.will ? hero.primaryWeapon.will : 0) +
      (hero.secondaryWeapon?.will ? hero.secondaryWeapon.will : 0) +
      (hero.chestpiece.will ? hero.chestpiece.will : 0);

    hero.regeneration =
      (hero.primaryWeapon.regeneration ? hero.primaryWeapon.regeneration : 0) +
      (hero.secondaryWeapon?.regeneration ? hero.secondaryWeapon.regeneration : 0) +
      (hero.chestpiece.regeneration ? hero.chestpiece.regeneration : 0);

    hero.mind =
      (hero.primaryWeapon.mind ? hero.primaryWeapon.mind : 0) +
      (hero.secondaryWeapon?.mind ? hero.secondaryWeapon.mind : 0) +
      (hero.chestpiece.mind ? hero.chestpiece.mind : 0);

    if (hero.id === 'druid' && this.getHeroAbilityById(hero, '32-war-tree')) {
      hero.primaryWeapon.range = 2;
    }

    return hero;
  }

  resetHeroState(hero: IHero) {
    hero.moveEnergyCost = Const.moveEnergyCost;
    hero.extraWeaponEnergyCost = 0;
    hero.isInvisible = false;
    hero.isSilenced = false;
    hero.isDisarmed = false;
    hero.isStunned = false;
    hero.isImmobilized = false;
    hero.isBlind = false;
    hero.isImmuneToDebuffs = false;
    hero.maxAllowedAbilityLevel = 4;

    if (hero.id === 'avatar') {
      hero.isImmuneToDisarm = true;

      if (this.getHeroAbilityById(hero, '21-flame-claws')) {
        hero.extraWeaponEnergyCost = -hero.primaryWeapon.energyCost;
      }
    } else {
      hero.isImmuneToDisarm = false;
    }
  }

  resetPetState(pet: IPet) {
    pet.regeneration = 0;
    pet.isStunned = false;
    pet.isDisarmed = false;
    pet.isImmobilized = false;
    pet.isSilenced = false;
    pet.isBlind = false;
    pet.isImmuneToDebuffs = false;
    pet.isImmuneToDisarm = false;
  }

  normalizeCharStats(char: IChar) {
    if (!char.isPet) {
      if ((char as IHero).strength < 0) {
        (char as IHero).strength = 0;
      }
      if ((char as IHero).strength > Const.maxPrimaryAttributes) {
        (char as IHero).strength = Const.maxPrimaryAttributes;
      }

      if ((char as IHero).intellect < 0) {
        (char as IHero).intellect = 0;
      }
      if ((char as IHero).intellect > Const.maxPrimaryAttributes) {
        (char as IHero).intellect = Const.maxPrimaryAttributes;
      }

      if ((char as IHero).armor < 0) {
        (char as IHero).armor = 0;
      }
      if ((char as IHero).armor > Const.maxPrimaryAttributes) {
        (char as IHero).armor = Const.maxPrimaryAttributes;
      }

      if ((char as IHero).will < 0) {
        (char as IHero).will = 0;
      }
      if ((char as IHero).will > Const.maxPrimaryAttributes) {
        (char as IHero).will = Const.maxPrimaryAttributes;
      }

      if ((char as IHero).mind < 0) {
        (char as IHero).mind = 0;
      }
      if ((char as IHero).mind > Const.maxSecondaryAttributes) {
        (char as IHero).mind = Const.maxSecondaryAttributes;
      }

      if ((char as IHero).moveEnergyCost < 0) {
        (char as IHero).moveEnergyCost = 0;
      }
    }
    if (char.regeneration < 0) {
      char.regeneration = 0;
    }
    if (char.regeneration > Const.maxSecondaryAttributes) {
      char.regeneration = Const.maxSecondaryAttributes;
    }
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
        const primaryWeaponIsUsed = activeHero.primaryWeapon.isUsed;
        activeHero.primaryWeapon = heroData.primaryWeapons[activeHero.primaryWeapon.level];
        activeHero.primaryWeapon.isUsed = primaryWeaponIsUsed;
        battle.log.push({
          type: LogMessageType.UPGRADE_EQUIP,
          id: activeHero.id,
          equipId: activeHero.primaryWeapon.id
        });
      } else if (activeHero.secondaryWeapon?.id === equipId && activeHero.secondaryWeapon?.level < 3) {
        const secondaryWeaponIsUsed = activeHero.secondaryWeapon.isUsed;
        activeHero.secondaryWeapon = heroData.secondaryWeapons[activeHero.secondaryWeapon.level];
        activeHero.secondaryWeapon.isUsed = secondaryWeaponIsUsed;
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
    const activeHero = this.getHeroById(battle.queue[0], heroes);
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
