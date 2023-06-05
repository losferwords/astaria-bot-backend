import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BattleController } from './controllers/battle.controller';
import { BotController } from './controllers/bot.controller';
import { AbilityService } from './services/ability.service';
import { BattleService } from './services/battle.service';
import { BotService } from './services/bot.service';
import { ReportService } from './services/report.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({
      timeout: 3600000
    })
  ],
  controllers: [BattleController, BotController],
  providers: [BattleService, AbilityService, BotService, ReportService]
})
export class AppModule {}
