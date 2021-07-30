import * as rfdc from 'rfdc';
import { Const } from '../static/const';
import { IEquip } from '../interfaces/IEquip';
import { IHero } from '../interfaces/IHero';
import { HeroesData } from '../static/heroes-data';
import { IHeroSetup } from '../interfaces/IHeroSetup';
import { IEffect } from '../interfaces/IEffect';
import { IAbility } from '../interfaces/IAbility';
import { IPet } from '../interfaces/IPet';
import { IHeroData } from 'src/interfaces/IHeroData';

export class Hero implements IHero {
  id: string;
  isPet: boolean = false;
  gender: string;
  maxEnergy: number;
  maxHealth: number;
  maxMana: number;
  effects: IEffect[] = [];
  abilities: IAbility[] = [];
  pets: IPet[] = [];
  primaryWeapon?: IEquip;
  secondaryWeapon?: IEquip;
  chestpiece?: IEquip;

  strength = 0;
  intellect = 0;
  armor = 0;
  will = 0;
  regeneration = 0;
  mind = 0;

  energy = 0;
  health = 0;
  mana = 0;

  isDead = false;
  isInvisible = false;
  isSilenced = false;
  isDisarmed = false;
  isStunned = false;
  isImmobilized = false;
  isImmuneToDisarm = false;

  moveEnergyCost = Const.moveEnergyCost;
  position = { x: 0, y: 0 };
  crystals = 0;

  constructor(heroSetup: IHeroSetup) {
    const heroData: IHeroData = rfdc({ proto: true })(HeroesData[heroSetup.hero]);
    this.id = heroData.id;
    this.gender = heroSetup.gender;

    this.maxEnergy = heroData.maxEnergy;
    this.maxHealth = heroData.maxHealth;
    this.maxMana = heroData.maxMana;

    this.health = this.maxHealth;
    this.energy = this.maxEnergy;
    this.mana = this.maxMana;

    this.primaryWeapon = heroData.primaryWeapons[0];

    if (heroData.secondaryWeapons) {
      this.secondaryWeapon = heroData.secondaryWeapons[0];
    }

    this.chestpiece = heroData.chestpieces[0];

    this.abilities = [];
  }
}
