import { IEffect } from 'src/interfaces/IEffect';

export class EffectsData {
  // Paragon
  public static readonly '11-sunder-armor': IEffect = {
    id: '11-sunder-armor',
    duration: 1,
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

  public static readonly '32-no-step-back': IEffect = {
    id: '32-no-step-back',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '41-piercing-strike': IEffect = {
    id: '41-piercing-strike',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '42-breakthrough': IEffect = {
    id: '42-breakthrough',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '43-rallying': IEffect = {
    id: '43-rallying',
    duration: 2,
    isBuff: true,
    isRemovable: false,
    range: 1
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

  public static readonly '31-halving': IEffect = {
    id: '31-halving',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '32-thunderer': IEffect = {
    id: '32-thunderer',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '42-ancestral-power': IEffect = {
    id: '42-ancestral-power',
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
    duration: 2,
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

  public static readonly '31-choking-vine': IEffect = {
    id: '31-choking-vine',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '33-power-of-the-pack': IEffect = {
    id: '33-power-of-the-pack',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '43-symbiosis': IEffect = {
    id: '43-symbiosis',
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

  public static readonly '33-mind-control': IEffect = {
    id: '33-mind-control',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '41-void-vortex': IEffect = {
    id: '41-void-vortex',
    duration: 2,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  public static readonly '43-amnesia': IEffect = {
    id: '43-amnesia',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  // Avatar
  public static readonly '13-fireball': IEffect = {
    id: '13-fireball',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '22-cauterization': IEffect = {
    id: '22-cauterization',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '23-scorch': IEffect = {
    id: '23-scorch',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '31-dragon-tail': IEffect = {
    id: '31-dragon-tail',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '32-elements-control': IEffect = {
    id: '32-elements-control',
    duration: 100,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '41-harmony': IEffect = {
    id: '41-harmony',
    duration: 2,
    isBuff: true,
    isRemovable: true
  };

  public static readonly '43-fire': IEffect = {
    id: '43-fire',
    duration: 2,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  // Shadow
  public static readonly '13-debilitating-shot': IEffect = {
    id: '13-debilitating-shot',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '23-blind': IEffect = {
    id: '23-blind',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '32-shadow-cloak': IEffect = {
    id: '32-shadow-cloak',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };

  public static readonly '43-oblivion': IEffect = {
    id: '43-oblivion',
    duration: 3,
    isBuff: false,
    isRemovable: true
  };

  // Lightbringer
  public static readonly '21-aura-of-might': IEffect = {
    id: '21-aura-of-might',
    duration: 100,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  public static readonly '22-aura-of-fortitude': IEffect = {
    id: '22-aura-of-fortitude',
    duration: 100,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  public static readonly '23-aura-of-light': IEffect = {
    id: '23-aura-of-light',
    duration: 100,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  public static readonly '32-sun-aegis': IEffect = {
    id: '32-sun-aegis',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };

  public static readonly '41-hammer-of-wrath': IEffect = {
    id: '41-hammer-of-wrath',
    duration: 1,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '42-divine-radiance': IEffect = {
    id: '42-divine-radiance',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };

  // Avenger
  public static readonly '22-quicksands': IEffect = {
    id: '22-quicksands',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '23-temporal-strike': IEffect = {
    id: '23-temporal-strike',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '32-sand-storm': IEffect = {
    id: '32-sand-storm',
    duration: 2,
    isBuff: true,
    isRemovable: false,
    range: 2
  };

  public static readonly '33-time-trap': IEffect = {
    id: '33-time-trap',
    duration: 2,
    isBuff: false,
    isRemovable: true
  };

  public static readonly '41-excellence': IEffect = {
    id: '41-excellence',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };

  public static readonly '42-sand-form': IEffect = {
    id: '42-sand-form',
    duration: 2,
    isBuff: true,
    isRemovable: false
  };
}
