import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IBattleSetupDto } from 'src/dto/battle-setup.dto';
import { CastAbilityDto } from 'src/dto/cast-ability.dto';
import { LearnAbilityDto } from 'src/dto/learn-ability.dto';
import { MoveHeroDto } from 'src/dto/move-hero.dto';
import { IScenarioSetupDto } from 'src/dto/scenario-setup.dto';
import { UpgradeEquipDto } from 'src/dto/upgrade-equip.dto';
import { UseWeaponDto } from 'src/dto/use-weapon.dto';
import { IBattle } from 'src/interfaces/IBattle';
import { IHeroData } from 'src/interfaces/IHeroData';
import { IPosition } from 'src/interfaces/IPosition';
import { AbilityService } from 'src/services/ability.service';
import { HeroService } from 'src/services/hero.service';
import { BattleService } from '../services/battle.service';

@Controller()
export class BattleController {
  constructor(private battleService: BattleService, private heroService: HeroService, private abilityService: AbilityService) {}

  @Get('/scenarios')
  async scenarios(): Promise<IScenarioSetupDto[]> {
    return this.battleService.getScenarios();
  }

  @Post('/start-battle')
  async startBattle(@Body() battleSetup: IBattleSetupDto): Promise<IBattle> {
    return this.battleService.startBattle(battleSetup);
  }

  @Get('/hero-data')
  async heroData(@Query('heroId') heroId: string): Promise<IHeroData> {
    return this.heroService.getHeroData(heroId);
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
    return this.battleService.endTurn(battle, false);
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

  @Get('/find-allies')
  async findAllies(
    @Query('battleId') battleId: string,
    @Query('sourceHeroId') sourceHeroId: string,
    @Query('radius') radius: number,
    @Query('includeSelf') includeSelf: boolean
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findAllies(battle, sourceHeroId, radius, includeSelf);
  }

  @Get('/find-heroes')
  async findHeroes(
    @Query('battleId') battleId: string,
    @Query('sourceHeroId') sourceHeroId: string,
    @Query('radius') radius: number
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findHeroes(battle, sourceHeroId, radius);
  }

  @Post('/use-weapon')
  async useWeapon(@Body() useWeaponDto: UseWeaponDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(useWeaponDto.battleId);
    return this.battleService.useWeapon(battle, useWeaponDto.targetId, useWeaponDto.weaponId, false);
  }

  @Post('/cast-ability')
  async castAbility(@Body() castAbilityDto: CastAbilityDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(castAbilityDto.battleId);
    const heroes = this.battleService.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const newBattle = this.abilityService.castAbility(battle, heroes, castAbilityDto.abilityId, activeHero, castAbilityDto.targetId, castAbilityDto.position, false);
    return this.battleService.afterCastAbility(newBattle, false);
  }

  @Post('/upgrade-equip')
  async upgradeEquip(@Body() upgradeEquipDto: UpgradeEquipDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(upgradeEquipDto.battleId);
    return this.battleService.upgradeEquip(battle, upgradeEquipDto.equipId);
  }

  @Post('/learn-ability')
  async learnAbility(@Body() learnAbilityDto: LearnAbilityDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(learnAbilityDto.battleId);
    return this.battleService.learnAbility(battle, learnAbilityDto.abilityId);
  }
}
