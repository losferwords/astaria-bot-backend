import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IBattleSetupDto } from 'src/dto/battle-setup.dto';
import { CastAbilityDto } from 'src/dto/cast-ability.dto';
import { LearnAbilityDto } from 'src/dto/learn-ability.dto';
import { MoveCharDto } from 'src/dto/move-char.dto';
import { IScenarioSetupDto } from 'src/dto/scenario-setup.dto';
import { UpgradeEquipDto } from 'src/dto/upgrade-equip.dto';
import { UseWeaponDto } from 'src/dto/use-weapon.dto';
import { IAbility } from 'src/interfaces/IAbility';
import { IBattle } from 'src/interfaces/IBattle';
import { IChar } from 'src/interfaces/IChar';
import { IHero } from 'src/interfaces/IHero';
import { IHeroData } from 'src/interfaces/IHeroData';
import { IPosition } from 'src/interfaces/IPosition';
import { AbilityService } from 'src/services/ability.service';
import { HeroService } from 'src/services/hero.service';
import { MapService } from 'src/services/map.service';
import { BattleService } from '../services/battle.service';

@Controller()
export class BattleController {
  constructor(
    private battleService: BattleService,
    private mapService: MapService,
    private heroService: HeroService,
    private abilityService: AbilityService
  ) {}

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
  async movePoints(@Query('battleId') battleId: string, @Query('petId') petId: string): Promise<IPosition[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.getMovePoints(battle, petId);
  }

  @Post('/move-char')
  async moveChar(@Body() moveCharDto: MoveCharDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(moveCharDto.battleId);
    return this.battleService.moveChar(battle, moveCharDto.position, false, moveCharDto.petId);
  }

  @Post('/end-turn')
  async endTurn(@Body('battleId') battleId: string): Promise<IBattle> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.endTurn(battle, false);
  }

  @Get('/find-enemies')
  async findEnemies(
    @Query('battleId') battleId: string,
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('abilityId') abilityId: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findEnemies(
      battle,
      sourceCharId,
      +radius,
      includeInvisible ? JSON.parse(includeInvisible) : false,
      abilityId,
      ignoreRaytrace ? JSON.parse(ignoreRaytrace) : false
    );
  }

  @Get('/find-allies')
  async findAllies(
    @Query('battleId') battleId: string,
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('includeSelf') includeSelf: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findAllies(
      battle,
      sourceCharId,
      +radius,
      JSON.parse(includeSelf),
      includeInvisible ? JSON.parse(includeInvisible) : false,
      ignoreRaytrace ? JSON.parse(ignoreRaytrace) : false
    );
  }

  @Get('/find-heroes')
  async findHeroes(
    @Query('battleId') battleId: string,
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('includeSelf') includeSelf: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): Promise<string[]> {
    const battle = this.battleService.getBattleById(battleId);
    return this.battleService.findHeroes(
      battle,
      sourceCharId,
      +radius,
      JSON.parse(includeSelf),
      includeInvisible ? JSON.parse(includeInvisible) : false,
      ignoreRaytrace ? JSON.parse(ignoreRaytrace) : false
    );
  }

  @Get('/map-ability-positions')
  async mapAbilityPositions(
    @Query('battleId') battleId: string,
    @Query('abilityId') abilityId: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string,
    @Query('ignoreObstacles') ignoreObstacles: string
  ): Promise<IPosition[]> {
    const battle = this.battleService.getBattleById(battleId);
    const heroes = this.battleService.getHeroesInBattle(battle);
    const activeHero = this.heroService.getHeroById(battle.queue[0], heroes);
    const ability: IAbility = this.heroService.getHeroAbilityById(activeHero, abilityId);

    return this.mapService.getMovePoints(
      activeHero.position,
      ability.range,
      battle.scenario.tiles,
      heroes,
      ignoreRaytrace ? JSON.parse(ignoreRaytrace) : null,
      ignoreObstacles ? JSON.parse(ignoreObstacles) : null
    );
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
    const activeHero: IHero = this.heroService.getHeroById(battle.queue[0], heroes);
    let activeChar: IChar = activeHero;
    const target: IChar =
      activeChar.id === castAbilityDto.targetId
        ? activeChar
        : this.heroService.getCharById(castAbilityDto.targetId, heroes);
    let ability: IAbility = this.heroService.getHeroAbilityById(activeHero, castAbilityDto.abilityId);

    //Maybe it is a pet ability
    if (!ability) {
      for (let i = 0; i < activeHero.pets.length; i++) {
        if (activeHero.pets[i].ability.id === castAbilityDto.abilityId) {
          ability = activeHero.pets[i].ability;
          activeChar = activeHero.pets[i];
        }
      }
    }
    const newBattle = this.abilityService.castAbility(
      battle,
      heroes,
      ability,
      activeChar,
      target,
      castAbilityDto.position,
      false
    );
    return this.battleService.afterCastAbility(
      newBattle,
      activeChar,
      heroes,
      ability,
      target,
      castAbilityDto.position,
      false
    );
  }

  @Post('/upgrade-equip')
  async upgradeEquip(@Body() upgradeEquipDto: UpgradeEquipDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(upgradeEquipDto.battleId);
    return this.battleService.upgradeEquip(battle, upgradeEquipDto.equipId, false);
  }

  @Post('/learn-ability')
  async learnAbility(@Body() learnAbilityDto: LearnAbilityDto): Promise<IBattle> {
    const battle = this.battleService.getBattleById(learnAbilityDto.battleId);
    return this.battleService.learnAbility(battle, learnAbilityDto.abilityId, false);
  }
}
