import { Controller, Post } from '@nestjs/common';
import { IBattle } from 'src/interfaces/IBattle';
import { BotService } from 'src/services/bot.service';

@Controller()
export class BotController {
  constructor(private botService: BotService) {}

  @Post('/bot-action')
  botAction(): IBattle {
    return this.botService.botAction();
  }
}
