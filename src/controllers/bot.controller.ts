import { Body, Controller, Post } from '@nestjs/common';
import { SimulationResponseDto } from 'src/dto/simulation-response.dto';
import { IStartSimulationDto } from 'src/dto/start-simulation.dto';
import { IBattle } from 'src/interfaces/IBattle';
import { BotNode } from 'src/models/BotNode';
import { ArchaeanTemple } from 'src/models/scenarios/archaean-temple';
import { ArenaOfAcheos1x1 } from 'src/models/scenarios/arena-of-acheos-1x1';
import { ArenaOfAcheos1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1';
import { ArenaOfAcheos1x1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1x1';
import { ArenaOfAcheos2x2 } from 'src/models/scenarios/arena-of-acheos-2x2';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';
import { BotService } from 'src/services/bot.service';

@Controller()
export class BotController {
  constructor(private botService: BotService) {}

  @Post('/bot-action')
  botAction(): Promise<IBattle> {
    return this.botService.botAction();
  }

  @Post('/start-simulation')
  startSimulation(@Body('startSimulationData') startSimulationDto: IStartSimulationDto): SimulationResponseDto {
    const rootNode = new BotNode(null, null, startSimulationDto.state, startSimulationDto.unexpandedActions);
    switch (startSimulationDto.state.scenario.id) {
      case '0':
        startSimulationDto.state.scenario = new ChthonRuins();
        break;
      case '1':
        startSimulationDto.state.scenario = new ArchaeanTemple();
        break;
      case '2':
        startSimulationDto.state.scenario = new ArenaOfAcheos1x1();
        break;
      case '3':
        startSimulationDto.state.scenario = new ArenaOfAcheos1x1x1();
        break;
      case '4':
        startSimulationDto.state.scenario = new ArenaOfAcheos1x1x1x1();
        break;
      case '5':
        startSimulationDto.state.scenario = new ArenaOfAcheos2x2();
        break;
    }
    const { nodes, simulationTime } = this.botService.startSimulation(rootNode, startSimulationDto.state, true);
    const simplifiedNodes = this.botService.simplifySimulationResults(nodes);
    let canBeSent = false;
    while (!canBeSent) {
      try {
        JSON.stringify(simplifiedNodes);
        canBeSent = true;
      } catch (e) {
        const originalLength = simplifiedNodes.length;
        simplifiedNodes.splice(originalLength > 5000 ? -5000 : 0);
        console.log(`splice external nodes from ${originalLength} to ${simplifiedNodes.length}`);
      }
    }

    return {
      nodes: simplifiedNodes,
      simulationTime
    };
  }
}
