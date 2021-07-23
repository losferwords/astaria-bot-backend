import * as _ from 'lodash';
import { IEffect } from '../interfaces/IEffect';
import { IAbility } from '../interfaces/IAbility';
import { IPet } from '../interfaces/IPet';
import { PetsData } from 'src/static/pets-data';
import { IPetData } from 'src/interfaces/IPetData';
import { IPosition } from 'src/interfaces/IPosition';

export class Pet implements IPet {
  id: string;
  isPet: boolean = true;
  maxHealth: number;
  effects: IEffect[] = [];
  ability: IAbility;

  health = 0;
  regeneration = 0;

  isStunned = false;
  isImmobilized = false;
  isDisarmed = false;
  isSilenced = false;
  isMoved = false;

  position = { x: 0, y: 0 };

  constructor(id: string, position: IPosition) {
    const petData: IPetData = _.cloneDeep(PetsData[id]);
    this.id = petData.id;
    this.maxHealth = petData.maxHealth;
    this.health = this.maxHealth;
    this.ability = petData.ability;
    this.position = position;
  }
}
