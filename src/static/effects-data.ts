import { IEffect } from 'src/interfaces/IEffect';

export class EffectsData {
  // Paragon
  public static readonly '11-sunder-armor': IEffect = {
    id: '11-sunder-armor',
    duration: 2,
    isBuff: false
  };

  public static readonly '12-shield-bash': IEffect = {
    id: '12-shield-bash',
    duration: 1,
    isBuff: false
  };

  public static readonly '13-shoulder-to-shoulder': IEffect = {
    id: '13-shoulder-to-shoulder',
    duration: 2,
    isBuff: true
  };

  // Highlander
  public static readonly '11-shoulder-punch': IEffect = {
    id: '11-shoulder-punch',
    duration: 1,
    isBuff: true
  };

  public static readonly '12-strong-grip': IEffect = {
    id: '12-strong-grip',
    duration: 2,
    isBuff: true
  };

  // Druid
  public static readonly '11-crown-of-thorns': IEffect = {
    id: '11-crown-of-thorns',
    duration: 2,
    isBuff: false
  };

  public static readonly '12-poison-touch': IEffect = {
    id: '12-poison-touch',
    duration: 2,
    isBuff: false
  };

  public static readonly '13-healing-wounds': IEffect = {
    id: '13-healing-wounds',
    duration: 3,
    isBuff: true
  };
}
