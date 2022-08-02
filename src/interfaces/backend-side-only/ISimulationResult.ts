import { BotNode } from 'src/models/BotNode';

export interface ISimulationResult {
  nodes: Map<string, BotNode>;
  simulationTime: number[];
}
