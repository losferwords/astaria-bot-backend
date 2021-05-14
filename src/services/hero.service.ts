import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { LogMessageType } from 'src/enums/log-message-type.enum';
import { IBattle } from 'src/interfaces/IBattle';
import { IEquip } from 'src/interfaces/IEquip';
import { IHero } from 'src/interfaces/IHero';
import { IHeroData } from 'src/interfaces/IHeroData';
import { IPosition } from 'src/interfaces/IPosition';
import { ITeam } from 'src/interfaces/ITeam';
import { Const } from 'src/static/const';
import { Helper } from 'src/static/helper';
import { HeroesData } from 'src/static/heroes-data';

@Injectable()
export class HeroService {
  constructor() {}

  heroTakesDamage(battle: IBattle, caster: IHero, target: IHero, value: number): boolean {
    if (value === 0) {
      return false;
    }
    target.health -= value;

    // this.afterDealingDamage();
    // this.afterDamageTaken();

    if (target.health <= 0) {
      this.heroDeath(battle, target);
    }

    return true;
  }

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

  private heroDeath(battle: IBattle, hero: IHero) {
    hero.health = 0;
    hero.energy = 0;
    hero.mana = 0;
    hero.effects = [];
    hero.isDead = true;

    battle.log.push({
      type: LogMessageType.DEATH,
      id: hero.id
    });

    const queueIndex = battle.queue.findIndex((heroId: string) => {
      return hero.id === heroId;
    });

    battle.queue.splice(queueIndex, 1);
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

  canMove(hero: IHero): boolean {
    return hero.energy - hero.moveEnergyCost >= 0 && !hero.isImmobilized;
  }

  canUseWeapon(hero: IHero, weapon: IEquip): boolean {
    return hero.energy - weapon.energyCost >= 0 && !hero.isDisarmed && !weapon.isUsed && !weapon.isPassive;
  }

  getHeroById(heroId: string, heroes: IHero[]) {
    return heroes.find((hero: IHero) => {
      return hero.id === heroId;
    });
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

  getHeroData(heroId: string): IHeroData {
    return HeroesData[heroId];
  }

  moveHero(battle: IBattle, activeHero: IHero, position: IPosition): IBattle {
    activeHero.position.x = position.x;
    activeHero.position.y = position.y;
    activeHero.energy -= activeHero.moveEnergyCost;
    battle.log.push({
      type: LogMessageType.MOVE,
      position: {
        x: position.x,
        y: position.y
      },
      id: activeHero.id
    });
    return battle;
  }

  useWeapon(battle: IBattle, heroes: IHero[], targetId: string, weaponId: string): IBattle {
    const activeHero = this.getHeroById(battle.queue[0], heroes);
    const target = this.getHeroById(targetId, heroes);
    let weapon: IEquip;

    if (activeHero.primaryWeapon.id === weaponId) {
      weapon = activeHero.primaryWeapon;
    } else if (activeHero.secondaryWeapon.id === weaponId) {
      weapon = activeHero.secondaryWeapon;
    } else {
      return battle;
    }

    if (!this.canUseWeapon(activeHero, weapon)) {
      return battle;
    }

    let physDamage = weapon.physDamage + activeHero.strength - target.armor;
    if (physDamage < 0) {
      physDamage = 0;
    }
    let magicDamage = weapon.magicDamage + activeHero.intellect - target.will;
    if (magicDamage < 0) {
      magicDamage = 0;
    }

    const totalDamage = physDamage + magicDamage;

    battle.log.push({
      type: LogMessageType.WEAPON_DAMAGE,
      casterId: activeHero.id,
      targetId: target.id,
      equipId: weapon.id,
      value: totalDamage + ''
    });

    this.heroTakesDamage(battle, activeHero, target, totalDamage);
    activeHero.energy -= weapon.energyCost;
    weapon.isUsed = true;

    return battle;
  }

  upgradeEquip(battle: IBattle, heroes: IHero[], equipId: string): IBattle {
    const activeHero = this.getHeroById(battle.queue[0], heroes);
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

      activeHero.calcHero();

      if (team.crystals > 0) {
        team.crystals -= 1;
      } else if (activeHero.crystals > 0) {
        activeHero.crystals -= 1;
      }
    }
    return battle;
  }
}
