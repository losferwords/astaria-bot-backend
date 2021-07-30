import { IEffect } from 'src/interfaces/IEffect';

export class EffectsData {
  // Paragon
  public static readonly '11-sunder-armor': IEffect = {
    id: '11-sunder-armor',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '12-shield-bash': IEffect = {
    id: '12-shield-bash',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '13-shoulder-to-shoulder': IEffect = {
    id: '13-shoulder-to-shoulder',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '21-spear-throw': IEffect = {
    id: '21-spear-throw',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '23-defender': IEffect = {
    id: '23-defender',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };

  // Highlander
  public static readonly '11-heavy-strike': IEffect = {
    id: '11-heavy-strike',
    duration: 1,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '12-strong-grip': IEffect = {
    id: '12-strong-grip',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '22-freedom-spirit': IEffect = {
    id: '22-freedom-spirit',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  // Druid
  public static readonly '11-crown-of-thorns': IEffect = {
    id: '11-crown-of-thorns',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '12-poison-touch': IEffect = {
    id: '12-poison-touch',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '13-wound-healing': IEffect = {
    id: '13-wound-healing',
    duration: 3,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '21-entangling-roots': IEffect = {
    id: '21-entangling-roots',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '23-breath-of-life': IEffect = {
    id: '23-breath-of-life',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  // Oracle
  public static readonly '23-paranoia': IEffect = {
    id: '23-paranoia',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };
}
