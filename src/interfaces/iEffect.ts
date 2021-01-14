import { IEffectState } from './IEffectState';

export interface IEffect {
    name: string;
    duration: number;
    state: IEffectState;
}
