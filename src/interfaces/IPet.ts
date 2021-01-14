import { IPetState } from './IPetState';

export interface IPet {
    id: string;
    maxHealth: number;
    state?: IPetState;
}
