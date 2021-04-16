import { Body, Controller, Post } from '@nestjs/common';
import { IBattle } from 'src/interfaces/IBattle';
import { BotService } from 'src/services/bot.service';

@Controller()
export class BotController {
  constructor(private botService: BotService) {}

  @Post('/bot-action')
  async botAction(@Body('battleId') battleId: string): Promise<IBattle> {
    return this.botService.botAction(battleId);
  }
}
