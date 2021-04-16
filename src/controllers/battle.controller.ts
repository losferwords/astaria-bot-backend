import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IBattleSetupDto } from 'src/dto/battle-setup.dto';
import { MoveHeroDto } from 'src/dto/move-hero.dto';
import { IScenarioSetupDto } from 'src/dto/scenario-setup.dto';
import { UseWeaponDto } from 'src/dto/use-weapon.dto';
import { IBattle } from 'src/interfaces/IBattle';
import { IPosition } from 'src/interfaces/IPosition';
import { BattleService } from '../services/battle.service';

@Controller()
export class BattleController {
  constructor(private battleService: BattleService) {}

  @Get('/scenarios')
  async scenarios(): Promise<IScenarioSetupDto[]> {
    return this.battleService.getScenarios();
  }

  @Post('/start-battle')
  async startBattle(@Body() battleSetup: IBattleSetupDto): Promise<IBattle> {
    return this.battleService.startBattle(battleSetup);
  }

  @Get('/move-points')
  async movePoints(@Query('battleId') battleId: string): Promise<IPosition[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.getMovePoints(battle);
  }

  @Post('/move-hero')
  async moveHero(@Body() moveHeroDto: MoveHeroDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(moveHeroDto.battleId);
    return this.battleService.moveHero(battle, moveHeroDto.position);
  }

  @Post('/end-turn')
  async endTurn(@Body('battleId') battleId: string): Promise<IBattle> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.endTurn(battle);
  }

  @Get('/find-enemies')
  async findEnemies(
    @Query('battleId') battleId: string,
    @Query('sourceHeroId') sourceHeroId: string,
    @Query('radius') radius: number
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findEnemies(battle, sourceHeroId, radius);
  }

  @Post('/use-weapon')
  async useWeapon(@Body() useWeaponDto: UseWeaponDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(useWeaponDto.battleId);
    return this.battleService.useWeapon(battle, useWeaponDto.targetId, useWeaponDto.weaponId);
  }
}
