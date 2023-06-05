import { IHeroData } from '../interfaces/IHeroData';
import { AbilitiesData } from './abilities-data';
import { EquipData } from './equip-data';

export class HeroesData {
  static readonly paragon: IHeroData = {
    id: 'paragon',
    maxEnergy: 12,
    maxHealth: 20,
    maxMana: 12,
    primaryWeapons: EquipData.paragon.primaryWeapons,
    secondaryWeapons: EquipData.paragon.secondaryWeapons,
    chestpieces: EquipData.paragon.chestpieces,
    abilities: AbilitiesData.paragon
  };

  static readonly highlander: IHeroData = {
    id: 'highlander',
    maxEnergy: 10,
    maxHealth: 18,
    maxMana: 18,
    primaryWeapons: EquipData.highlander.primaryWeapons,
    chestpieces: EquipData.highlander.chestpieces,
    abilities: AbilitiesData.highlander
  };

  static readonly druid: IHeroData = {
    id: 'druid',
    maxEnergy: 12,
    maxHealth: 16,
    maxMana: 16,
    primaryWeapons: EquipData.druid.primaryWeapons,
    chestpieces: EquipData.druid.chestpieces,
    abilities: AbilitiesData.druid
  };

  static readonly oracle: IHeroData = {
    id: 'oracle',
    maxEnergy: 12,
    maxHealth: 12,
    maxMana: 20,
    primaryWeapons: EquipData.oracle.primaryWeapons,
    chestpieces: EquipData.oracle.chestpieces,
    abilities: AbilitiesData.oracle
  };

  static readonly avatar: IHeroData = {
    id: 'avatar',
    maxEnergy: 12,
    maxHealth: 14,
    maxMana: 18,
    primaryWeapons: EquipData.avatar.primaryWeapons,
    chestpieces: EquipData.avatar.chestpieces,
    abilities: AbilitiesData.avatar
  };

  static readonly shadow: IHeroData = {
    id: 'shadow',
    maxEnergy: 14,
    maxHealth: 14,
    maxMana: 14,
    primaryWeapons: EquipData.shadow.primaryWeapons,
    chestpieces: EquipData.shadow.chestpieces,
    abilities: AbilitiesData.shadow
  };

  static readonly lightbringer: IHeroData = {
    id: 'lightbringer',
    maxEnergy: 10,
    maxHealth: 18,
    maxMana: 18,
    primaryWeapons: EquipData.lightbringer.primaryWeapons,
    chestpieces: EquipData.lightbringer.chestpieces,
    abilities: AbilitiesData.lightbringer
  };

  static readonly avenger: IHeroData = {
    id: 'avenger',
    maxEnergy: 14,
    maxHealth: 16,
    maxMana: 12,
    primaryWeapons: EquipData.avenger.primaryWeapons,
    secondaryWeapons: EquipData.avenger.secondaryWeapons,
    chestpieces: EquipData.avenger.chestpieces,
    abilities: AbilitiesData.avenger
  };

  static readonly navarch: IHeroData = {
    id: 'navarch',
    maxEnergy: 14,
    maxHealth: 15,
    maxMana: 13,
    primaryWeapons: EquipData.navarch.primaryWeapons,
    secondaryWeapons: EquipData.navarch.secondaryWeapons,
    chestpieces: EquipData.navarch.chestpieces,
    abilities: AbilitiesData.navarch
  };
}
