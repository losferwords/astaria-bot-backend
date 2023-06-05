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
import { BattleService } from '../services/battle.service';
import CharHelper from 'src/helpers/char.helper';
import MapHelper from 'src/helpers/map.helper';
import BattleHelper from 'src/helpers/battle.helper';

@Controller()
export class BattleController {
  constructor(private battleService: BattleService, private abilityService: AbilityService) {}

  @Get('/scenarios')
  scenarios(): IScenarioSetupDto[] {
    return BattleHelper.getScenarios();
  }

  @Post('/start-battle')
  startBattle(@Body() battleSetup: IBattleSetupDto): IBattle {
    return this.battleService.startBattle(battleSetup);
  }

  @Get('/hero-data')
  heroData(@Query('heroId') heroId: string): IHeroData {
    return CharHelper.getHeroData(heroId);
  }

  @Get('/move-points')
  movePoints(@Query('petId') petId: string): IPosition[] {
    if (this.battleService.battle) {
      return BattleHelper.getMovePoints(this.battleService.battle, petId);
    } else {
      return [];
    }
  }

  @Post('/move-char')
  moveChar(@Body() moveCharDto: MoveCharDto): IBattle {
    return this.battleService.moveChar(this.battleService.battle, moveCharDto.position, false, moveCharDto.petId);
  }

  @Post('/end-turn')
  endTurn(): IBattle {
    return this.battleService.endTurn(this.battleService.battle, false);
  }

  @Get('/find-enemies')
  findEnemies(
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('abilityId') abilityId: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): string[] {
    return BattleHelper.findEnemies(
      this.battleService.battle,
      sourceCharId,
      +radius,
      includeInvisible ? (JSON.parse(includeInvisible) as boolean) : false,
      abilityId,
      ignoreRaytrace ? (JSON.parse(ignoreRaytrace) as boolean) : false,
      true
    );
  }

  @Get('/find-allies')
  findAllies(
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('includeSelf') includeSelf: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): string[] {
    return BattleHelper.findAllies(
      this.battleService.battle,
      sourceCharId,
      +radius,
      JSON.parse(includeSelf) as boolean,
      includeInvisible ? (JSON.parse(includeInvisible) as boolean) : false,
      ignoreRaytrace ? (JSON.parse(ignoreRaytrace) as boolean) : false,
      true
    );
  }

  @Get('/find-heroes')
  findHeroes(
    @Query('sourceCharId') sourceCharId: string,
    @Query('radius') radius: string,
    @Query('includeInvisible') includeInvisible: string,
    @Query('includeSelf') includeSelf: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string
  ): string[] {
    return BattleHelper.findHeroes(
      this.battleService.battle,
      sourceCharId,
      +radius,
      JSON.parse(includeSelf) as boolean,
      includeInvisible ? (JSON.parse(includeInvisible) as boolean) : false,
      ignoreRaytrace ? (JSON.parse(ignoreRaytrace) as boolean) : false,
      true
    );
  }

  @Get('/map-ability-positions')
  mapAbilityPositions(
    @Query('abilityId') abilityId: string,
    @Query('ignoreRaytrace') ignoreRaytrace: string,
    @Query('ignoreObstacles') ignoreObstacles: string
  ): IPosition[] {
    const battle = this.battleService.battle;
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero = CharHelper.getHeroById(battle.queue[0], heroes);
    const ability: IAbility = CharHelper.getHeroAbilityById(activeHero, abilityId);

    return MapHelper.getMovePoints(
      activeHero.position,
      activeHero.isBlind ? 1 : ability.range,
      battle.scenario.tiles,
      heroes,
      ignoreRaytrace ? (JSON.parse(ignoreRaytrace) as boolean) : false,
      ignoreObstacles ? (JSON.parse(ignoreObstacles) as boolean) : false
    );
  }

  @Post('/use-weapon')
  useWeapon(@Body() useWeaponDto: UseWeaponDto): IBattle {
    return this.battleService.useWeapon(this.battleService.battle, useWeaponDto.targetId, useWeaponDto.weaponId, false);
  }

  @Post('/cast-ability')
  castAbility(@Body() castAbilityDto: CastAbilityDto): IBattle {
    const battle = this.battleService.battle;
    const heroes = BattleHelper.getHeroesInBattle(battle);
    const activeHero: IHero = CharHelper.getHeroById(battle.queue[0], heroes);
    let activeChar: IChar = activeHero;
    const target: IChar =
      activeChar.id === castAbilityDto.targetId ? activeChar : CharHelper.getCharById(castAbilityDto.targetId, heroes);
    let ability: IAbility = CharHelper.getHeroAbilityById(activeHero, castAbilityDto.abilityId);

    // Maybe it is a pet ability
    if (!ability) {
      for (let i = 0; i < activeHero.pets.length; i++) {
        if (activeHero.pets[i].ability.id === castAbilityDto.abilityId) {
          ability = activeHero.pets[i].ability;
          activeChar = activeHero.pets[i];
        }
      }
    }
    this.abilityService.castAbility(battle, heroes, ability, activeChar, target, castAbilityDto.position, false);
    // return this.battleService.afterCastAbility(
    //   newBattle,
    //   activeChar,
    //   heroes,
    //   ability,
    //   target,
    //   castAbilityDto.position,
    //   false
    // );
    return battle;
  }

  @Post('/upgrade-equip')
  upgradeEquip(@Body() upgradeEquipDto: UpgradeEquipDto): IBattle {
    return this.battleService.upgradeEquip(this.battleService.battle, upgradeEquipDto.equipId, false);
  }

  @Post('/learn-ability')
  learnAbility(@Body() learnAbilityDto: LearnAbilityDto): IBattle {
    return this.battleService.learnAbility(this.battleService.battle, learnAbilityDto.abilityId, false);
  }
}
