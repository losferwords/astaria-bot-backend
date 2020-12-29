import { Const } from "../static/const";
import { IEquip } from "../interfaces/iEquip";
import { IHero } from "../interfaces/IHero";
import { IHeroState } from "../interfaces/IHeroState";
import { HeroesData } from "../static/heroes-data";

export class Hero implements IHero {
    id: string;
    maxEnergy: number;
    maxHealth: number;
    maxMana: number;
    state: IHeroState = {
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
        extraStrength: 0,
        extraIntellect: 0,
        extraArmor: 0,
        extraWill: 0,
        extraRegeneration: 0,
        extraMind: 0,
        isDead: false,
        isInvisible: false,
        isSilenced: false,
        isDisarmed: false,
        isStunned: false,
        isImmobilized: false,
        moveEnergyCost: Const.moveEnergyCost,
        position: {x: 0, y: 0},
        crystals: 0
    }
    primaryWeapons: IEquip[];
    secondaryWeapons: IEquip[];
    chestpieces: IEquip[];

    constructor(id: string) {
        for(const key in this) {
            if(this.hasOwnProperty(key)) {
                this[key] = HeroesData[id][key];
            }
        }
        this.state.health = this.maxHealth;
        this.state.energy = this.maxEnergy;
        this.state.mana = this.maxMana;
        this.state.primaryWeapon = this.secondaryWeapons[0];
        this.state.primaryWeapon.state.isUsed = false;

        if(this.secondaryWeapons.length > 0) {
            this.state.secondaryWeapon = this.secondaryWeapons[0];
            this.state.secondaryWeapon.state.isUsed = false;
        }
        this.state.chestpiece = this.chestpieces[0];
        this.state.chestpiece.state.isUsed = false;
    }

    calcHero() {}
}