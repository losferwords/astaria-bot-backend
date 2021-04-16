import { Module } from '@nestjs/common';
import { BattleController } from './controllers/battle.controller';
import { BotController } from './controllers/bot.controller';
import { BattleService } from './services/battle.service';
import { BotService } from './services/bot.service';
import { HeroService } from './services/hero.service';
import { MapService } from './services/map.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [],
  controllers: [BattleController, BotController],
  providers: [HeroService, MapService, BattleService, BotService, ReportService]
})
export class AppModule {}
