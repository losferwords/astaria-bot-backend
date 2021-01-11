import { Const } from '../static/const';
import { IEquip } from '../interfaces/iEquip';
import { IHero } from '../interfaces/IHero';
import { IHeroState } from '../interfaces/IHeroState';
import { HeroesData } from '../static/heroes-data';
import { ITeamSetup } from '../interfaces/ITeamSetup';
import _ from 'lodash';

export class Hero implements IHero {
    id: string;
    gender: string;
    maxEnergy: number;
    maxHealth: number;
    maxMana: number;
    state: IHeroState;
    primaryWeapons: IEquip[];
    secondaryWeapons: IEquip[];
    chestpieces: IEquip[];

    constructor(teamSetup: ITeamSetup) {
        const heroData = _.cloneDeep(HeroesData[teamSetup.hero]);
        this.id = heroData.id;
        this.maxEnergy = heroData.maxEnergy;
        this.maxHealth = heroData.maxHealth;
        this.maxMana = heroData.maxMana;
        this.primaryWeapons = heroData.primaryWeapons;
        if (heroData.secondaryWeapons) {
            this.secondaryWeapons = heroData.secondaryWeapons;
        }
        this.chestpieces = heroData.chestpieces;

        this.resetState();

        this.gender = teamSetup.gender;
        this.state.health = this.maxHealth;
        this.state.energy = this.maxEnergy;
        this.state.mana = this.maxMana;

        this.state.primaryWeapon = this.primaryWeapons[0];
        this.state.primaryWeapon.state = {
            isUsed: false
        };

        if (this.secondaryWeapons) {
            this.state.secondaryWeapon = this.secondaryWeapons[0];
            this.state.secondaryWeapon.state = {
                isUsed: false
            };
        }

        this.state.chestpiece = this.chestpieces[0];
        this.state.chestpiece.state = {
            isUsed: false
        };

        this.calcHero();
    }

    resetState(): void {
        this.state = {
            buffs: [],
            debuffs: [],
            abilities: [],
            strength: 0,
            intellect: 0,
            armor: 0,
            will: 0,
            regeneration: 0,
            mind: 0,
            energy: 0,
            health: 0,
            mana: 0,
            isDead: false,
            isInvisible: false,
            isSilenced: false,
            isDisarmed: false,
            isStunned: false,
            isImmobilized: false,
            moveEnergyCost: Const.moveEnergyCost,
            position: {x: 0, y: 0},
            crystals: 0
        };
    }

    calcHero() {
        this.state.strength = this.state.primaryWeapon.strength + (this.state.secondaryWeapon ? this.state.secondaryWeapon.strength : 0) + this.state.chestpiece.strength;
        if (this.state.strength < 0) {
            this.state.strength = 0;
        }
        if (this.state.strength > Const.maxPrimaryAttributes) {
            this.state.strength = Const.maxPrimaryAttributes;
        }

        this.state.intellect = this.state.primaryWeapon.intellect + (this.state.secondaryWeapon ? this.state.secondaryWeapon.intellect : 0) + this.state.chestpiece.intellect;
        if (this.state.intellect < 0) {
            this.state.intellect = 0;
        }
        if (this.state.intellect > Const.maxPrimaryAttributes) {
            this.state.intellect = Const.maxPrimaryAttributes;
        }

        this.state.armor = this.state.primaryWeapon.armor + (this.state.secondaryWeapon ? this.state.secondaryWeapon.armor : 0) + this.state.chestpiece.armor;
        if (this.state.armor < 0) {
            this.state.armor = 0;
        }
        if (this.state.armor > Const.maxPrimaryAttributes) {
            this.state.armor = Const.maxPrimaryAttributes;
        }

        this.state.will = this.state.primaryWeapon.will + (this.state.secondaryWeapon ? this.state.secondaryWeapon.will : 0) + this.state.chestpiece.will;
        if (this.state.will < 0) {
            this.state.will = 0;
        }
        if (this.state.will > Const.maxPrimaryAttributes) {
            this.state.will = Const.maxPrimaryAttributes;
        }

        this.state.regeneration = this.state.primaryWeapon.regeneration + (this.state.secondaryWeapon ? this.state.secondaryWeapon.regeneration : 0) + this.state.chestpiece.regeneration;
        if (this.state.regeneration < 0) {
            this.state.regeneration = 0;
        }
        if (this.state.regeneration > Const.maxSecondaryAttributes) {
            this.state.regeneration = Const.maxSecondaryAttributes;
        }

        this.state.mind = this.state.primaryWeapon.mind + (this.state.secondaryWeapon ? this.state.secondaryWeapon.mind : 0) + this.state.chestpiece.mind;
        if (this.state.mind < 0) {
            this.state.mind = 0;
        }
        if (this.state.mind > Const.maxSecondaryAttributes) {
            this.state.mind = Const.maxSecondaryAttributes;
        }
    }
}
