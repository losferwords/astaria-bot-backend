import { Const } from '../static/const';
import { IEquip } from '../interfaces/IEquip';
import { IHero } from '../interfaces/IHero';
import { HeroesData } from '../static/heroes-data';
import { IHeroSetup } from '../interfaces/IHeroSetup';
import _ from 'lodash';
import { IEffect } from '../interfaces/IEffect';
import { IAbility } from '../interfaces/IAbility';
import { IPet } from '../interfaces/IPet';

export class Hero implements IHero {
    id: string;
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

    moveEnergyCost = Const.moveEnergyCost;
    position = {x: 0, y: 0};
    crystals = 0;

    constructor(heroSetup: IHeroSetup) {
        const heroData = _.cloneDeep(HeroesData[heroSetup.hero]);
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

        this.calcHero();
    }

    calcHero() {
        this.strength = this.primaryWeapon.strength + (this.secondaryWeapon ? this.secondaryWeapon.strength : 0) + this.chestpiece.strength;
        if (this.strength < 0) {
            this.strength = 0;
        }
        if (this.strength > Const.maxPrimaryAttributes) {
            this.strength = Const.maxPrimaryAttributes;
        }

        this.intellect = this.primaryWeapon.intellect + (this.secondaryWeapon ? this.secondaryWeapon.intellect : 0) + this.chestpiece.intellect;
        if (this.intellect < 0) {
            this.intellect = 0;
        }
        if (this.intellect > Const.maxPrimaryAttributes) {
            this.intellect = Const.maxPrimaryAttributes;
        }

        this.armor = this.primaryWeapon.armor + (this.secondaryWeapon ? this.secondaryWeapon.armor : 0) + this.chestpiece.armor;
        if (this.armor < 0) {
            this.armor = 0;
        }
        if (this.armor > Const.maxPrimaryAttributes) {
            this.armor = Const.maxPrimaryAttributes;
        }

        this.will = this.primaryWeapon.will + (this.secondaryWeapon ? this.secondaryWeapon.will : 0) + this.chestpiece.will;
        if (this.will < 0) {
            this.will = 0;
        }
        if (this.will > Const.maxPrimaryAttributes) {
            this.will = Const.maxPrimaryAttributes;
        }

        this.regeneration = this.primaryWeapon.regeneration + (this.secondaryWeapon ? this.secondaryWeapon.regeneration : 0) + this.chestpiece.regeneration;
        if (this.regeneration < 0) {
            this.regeneration = 0;
        }
        if (this.regeneration > Const.maxSecondaryAttributes) {
            this.regeneration = Const.maxSecondaryAttributes;
        }

        this.mind = this.primaryWeapon.mind + (this.secondaryWeapon ? this.secondaryWeapon.mind : 0) + this.chestpiece.mind;
        if (this.mind < 0) {
            this.mind = 0;
        }
        if (this.mind > Const.maxSecondaryAttributes) {
            this.mind = Const.maxSecondaryAttributes;
        }
    }

    private resetState() {
        this.moveEnergyCost = Const.moveEnergyCost;
        this.isDead = false;
        this.isInvisible = false;
        this.isSilenced = false;
        this.isDisarmed = false;
        this.isStunned = false;
        this.isImmobilized = false;
    }

    private applyEffects() {
        // ToDo
    }

    beforeTurn() {
        if (this.isDead) {
            return;
        }

        this.resetState();
        this.applyEffects();

        if (this.isDead) {
            return; // check again because after DOT hero can die
        }

        this.calcHero();

        this.energy = this.maxEnergy;
        if (this.health + this.regeneration < this.maxHealth){
            this.health += this.regeneration;
        } else {
            this.health = this.maxHealth;
        }

        if (this.mana + this.mind < this.maxMana){
            this.mana += this.mind;
        } else {
            this.mana = this.maxMana;
        }

        for (let i = 0; i < this.abilities.length; i++){
            if (this.abilities[i].cd > 0){
                this.abilities[i].cd--;
            }
        }
    }
}
