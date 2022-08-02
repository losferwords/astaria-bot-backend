import { ISimplifiedBotNode } from 'src/interfaces/backend-side-only/ISimplifiedBotNode';

export interface SimulationResponseDto {
  nodes: [string, ISimplifiedBotNode][];
  simulationTime: number[];
}
