import { IHeroData } from '../interfaces/IHeroData';
import { AbilitiesData } from './abilities-data';
import { EquipData } from './equip-data';

export class HeroesData {
  public static readonly paragon: IHeroData = {
    id: 'paragon',
    maxEnergy: 12,
    maxHealth: 20,
    maxMana: 12,
    primaryWeapons: EquipData.paragon.primaryWeapons,
    secondaryWeapons: EquipData.paragon.secondaryWeapons,
    chestpieces: EquipData.paragon.chestpieces,
    abilities: AbilitiesData.paragon
  };

  public static readonly highlander: IHeroData = {
    id: 'highlander',
    maxEnergy: 10,
    maxHealth: 18,
    maxMana: 18,
    primaryWeapons: EquipData.highlander.primaryWeapons,
    chestpieces: EquipData.highlander.chestpieces,
    abilities: AbilitiesData.highlander
  };

  public static readonly druid: IHeroData = {
    id: 'druid',
    maxEnergy: 10,
    maxHealth: 16,
    maxMana: 20,
    primaryWeapons: EquipData.druid.primaryWeapons,
    chestpieces: EquipData.druid.chestpieces,
    abilities: AbilitiesData.druid
  };

  public static readonly oracle: IHeroData = {
    id: 'oracle',
    maxEnergy: 12,
    maxHealth: 12,
    maxMana: 20,
    primaryWeapons: EquipData.oracle.primaryWeapons,
    chestpieces: EquipData.oracle.chestpieces,
    abilities: AbilitiesData.oracle
  };
}
