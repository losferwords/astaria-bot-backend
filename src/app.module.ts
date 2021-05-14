import { Module } from '@nestjs/common';
import { BattleController } from './controllers/battle.controller';
import { BotController } from './controllers/bot.controller';
import { AbilityService } from './services/ability.service';
import { BattleService } from './services/battle.service';
import { BotService } from './services/bot.service';
import { HeroService } from './services/hero.service';
import { MapService } from './services/map.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [],
  controllers: [BattleController, BotController],
  providers: [HeroService, MapService, BattleService, AbilityService, BotService, ReportService]
})
export class AppModule {}
