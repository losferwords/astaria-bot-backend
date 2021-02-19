import { IBattle } from '../interfaces/IBattle';
import { v1 as uuid } from 'uuid';
import { ChthonRuins } from '../models/maps/chthon-ruins';
import { Team } from '../models/Team';
import { IBattleSetup } from '../interfaces/IBattleSetup';
import { Const } from '../static/const';
import { Helper } from '../static/helper';
import { ITeam } from '../interfaces/ITeam';
import _ from 'lodash';
import { IHero } from '../interfaces/IHero';
import { IPosition } from '../interfaces/IPosition';
import { TileType } from '../enums/tile-type.enum';
import { ITile } from '../interfaces/ITile';
import { IChar } from '../interfaces/IChar';
import { IEquip } from '../interfaces/IEquip';
import { LogMessageType } from '../enums/log-message-type.enum';
import { ReportService } from './report.service';

export class BattleService {
    reportService: ReportService = new ReportService();
    battles: IBattle[] = [];

    constructor() {}

    private setRandomHeroes(teamSetup) {
        const availableHeroes = [...Const.moveOrder];
        const randomHeroes = [];
        for (let i = 0; i < teamSetup.length; i++) {
            for (let j = 0; j < teamSetup[i].length; j++) {
                const heroName = teamSetup[i][j].hero;
                if (heroName === 'random') {
                    randomHeroes.push(teamSetup[i][j]);
                } else {
                    availableHeroes.splice(availableHeroes.indexOf(heroName), 1);
                }
            }
        }
        while (randomHeroes.length > 0) {
            const randomHeroIndex = Helper.randomInt(0, availableHeroes.length - 1);
            randomHeroes[0].hero = availableHeroes[randomHeroIndex];
            availableHeroes.splice(randomHeroIndex, 1);
            randomHeroes.splice(0, 1);
        }
    }

    private getQueue(teams: ITeam[]): string[] {
        const heroes = [];
        for (let i = 0; i < teams.length; i++){
            for (let j = 0; j < teams[i].heroes.length; j++) {
                heroes.push(teams[i].heroes[j].id);
            }
        }
        return _.intersection(Const.moveOrder, heroes);
    }

    private getHeroesInBattle(battle: IBattle): IHero[] {
        const heroes = [];
        for (let i = 0; i < battle.teams.length; i++){
            for (let j = 0; j < battle.teams[i].heroes.length; j++) {
                heroes.push(battle.teams[i].heroes[j]);
            }
        }
        return heroes;
    }

    private findNearestPoints(position: IPosition, tiles: ITile[][], radius: number): IPosition[] {
        const points = [];
        for (let i = -radius; i <= radius; i++) {
            if (position.x + i >= 0 && position.x + i < tiles[0].length) {
                for (let j = -radius; j <= radius; j++) {
                    if (position.y + j >= 0 && position.y + j < tiles.length){
                        points.push({x: position.x + i, y: position.y + j});
                    }
                }
            }
        }
        return points;
    }

    canMove(hero: IHero): boolean {
        return hero.energy - hero.moveEnergyCost >= 0 && !hero.isImmobilized;
    }

    canUseWeapon(hero: IHero, weapon: IEquip): boolean {
        return hero.energy - weapon.energyCost >= 0 && !hero.isDisarmed && !weapon.isUsed && !weapon.isPassive;
    }

    getHeroById(heroId: string, battle: IBattle) {
        const heroes = this.getHeroesInBattle(battle);
        return heroes.find((hero: IHero) => {
            return hero.id === heroId;
        });
    }

    private getPossibleEnemies(heroId: string, battle: IBattle): IChar[] {
        const possibleEnemies: IChar[] = [];
        let enemyHeroes: IHero[] = [];
        enemyHeroes = battle.teams.find((team: ITeam) => {
            return !team.heroes.find((hero: IHero) => {
                return hero.id === heroId;
            });
        }).heroes;

        for (let i = 0; i < enemyHeroes.length; i++) {
            possibleEnemies.push(enemyHeroes[i]);
            for (let j = 0; j < enemyHeroes[i].pets.length; j++){
                possibleEnemies.push(enemyHeroes[i].pets[j]);
            }
        }
        return possibleEnemies;
    }

    private rayTrace(startCoordinates: IPosition, endCoordinates: IPosition, battle: IBattle): boolean {
        const coordinatesArray = [];
        const tileSize = Const.rayTracePrecision;

        let x1 = startCoordinates.x * tileSize + tileSize / 2;
        let y1 = startCoordinates.y * tileSize + tileSize / 2;
        const x2 = endCoordinates.x * tileSize + tileSize / 2;
        const y2 = endCoordinates.y * tileSize + tileSize / 2;

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        coordinatesArray.push({x: x1, y: y1});

        while (!((x1 === x2) && (y1 === y2))) {
            const e2 = err * 2;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            coordinatesArray.push({x: x1, y: y1});
        }

        for (let i = 0; i < coordinatesArray.length; i++){
            const x = coordinatesArray[i].x;
            const y = coordinatesArray[i].y;

            const localX = Math.floor(x / tileSize);
            const localY = Math.floor(y / tileSize);

            if ((x % tileSize === 0 || y % tileSize === 0) ||
                (startCoordinates.x === localX && startCoordinates.y === localY) ||
                (endCoordinates.x === localX && endCoordinates.y === localY))
            {
                continue;
            }

            if (this.checkTileForObstacle({x: localX, y: localY}, battle)){
                return true;
            }
        }
        return false;
    }

    private heroTakesDamage(battle: IBattle, caster: IHero, target: IHero, value: number): boolean {
        if (value === 0) {
            return false;
        }
        target.health -= value;

        // this.afterDealingDamage();
        // this.afterDamageTaken();

        if (target.health <= 0) {
            this.heroDeath(battle, target);
        }

        return true;
    }

    private battleEnd(battle: IBattle, winner: ITeam) {
        let winnerHeroes = '';
        for (let i = 0; i < winner.heroes.length; i++) {
            winnerHeroes += winner.heroes[i].id + ' ';
        }
        battle.log.push({
            type: LogMessageType.WIN,
            id: winnerHeroes
        });

        const battleIndex = this.battles.findIndex((b: IBattle) => {
            return b.id === battle.id;
        });

        this.battles.splice(battleIndex, 1);
        this.reportService.saveBattleResults(battle);
        this.reportService.addToStatistics(battle, winner);
    }

    private heroDeath(battle: IBattle, hero: IHero) {
        hero.health = 0;
        hero.energy = 0;
        hero.mana = 0;
        hero.effects = [];
        hero.isDead = true;

        battle.log.push({
            type: LogMessageType.DEATH,
            id: hero.id
        });

        const queueIndex = battle.queue.findIndex((heroId: string) => {
            return hero.id === heroId;
        });

        battle.queue.splice(queueIndex, 1);
    }

    getBattleById(id: string): IBattle {
        return this.battles.find((battle: IBattle) => {
            return battle.id === id;
        });
    }

    getScenarioTeamSize(id: string): number[] {
        switch (id) {
            case '1': return [2, 2];
        }
    }

    startBattle(battleSetup: IBattleSetup): IBattle {
        let battle: IBattle;
        switch (battleSetup.scenarioId) {
            case '1':
                this.setRandomHeroes(battleSetup.teamSetup);
                battle = {
                    id: uuid(),
                    map: new ChthonRuins(),
                    teams: [new Team(battleSetup.teamSetup[0]), new Team(battleSetup.teamSetup[1])],
                    queue: [],
                    log: []
                };
                battle.map.setHeroPositions(battle.teams);
                battle.queue = this.getQueue(battle.teams);
                break;
        }
        this.battles.push(battle);
        return battle;
    }

    checkTileForObstacle(position: IPosition, battle: IBattle): boolean {
        if (battle.map.tiles[position.y] && battle.map.tiles[position.y][position.x] && battle.map.tiles[position.y][position.x].type === TileType.FLOOR) {
            const heroes = this.getHeroesInBattle(battle);
            for (let i = 0; i < heroes.length; i++){
                for (let j = 0; j < heroes[i].pets.length; j++) {
                    if (heroes[i].pets[j].position.x === position.x &&
                        heroes[i].pets[j].position.y === position.y)
                    {
                        return true;
                    }
                }
                if (heroes[i].position.x === position.x &&
                    heroes[i].position.y === position.y &&
                    !heroes[i].isDead)
                {
                    return true;
                }
            }
            return false;
        } else {
            return true;
        }
    }

    getMovePoints(battle: IBattle, radius: number = 1): IPosition[] {
        const activeHero = this.getHeroById(battle.queue[0], battle);
        const points = this.findNearestPoints(activeHero.position, battle.map.tiles, radius);

        const availablePoints = [];
        if (this.canMove(activeHero)) {
            for (let i = 0; i < points.length; i++){
                if (!this.checkTileForObstacle(points[i], battle)){
                    availablePoints.push(points[i]);
                }
            }
        }
        return availablePoints;
    }

    moveHero(battleId: string, position: IPosition): IBattle {
        const battle = this.getBattleById(battleId);
        const activeHero = this.getHeroById(battle.queue[0], battle);

        if (this.canMove(activeHero)) {
            activeHero.position.x = position.x;
            activeHero.position.y = position.y;
            activeHero.energy -= activeHero.moveEnergyCost;
            battle.log.push({
                type: LogMessageType.MOVE,
                position: {
                    x: position.x,
                    y: position.y
                },
                id: activeHero.id
            });
        }
        return battle;
    }

    endTurn(battleId: string): IBattle {
        const battle = this.getBattleById(battleId);

        battle.log.push({
            type: LogMessageType.TURN_END,
            id: battle.queue[0]
        });

        battle.queue.push(battle.queue.shift());
        const activeHero = this.getHeroById(battle.queue[0], battle);
        activeHero.beforeTurn();

        return battle;
    }

    findEnemies(battle: IBattle, sourceHeroId: string, radius: number = 1): string[] {
        const sourceHero = this.getHeroById(sourceHeroId, battle);
        const points = this.findNearestPoints(sourceHero.position, battle.map.tiles, radius);

        const possibleEnemies = this.getPossibleEnemies(sourceHeroId, battle);

        const enemies = [];
        for (let i = 0; i < points.length; i++){
            for (let j = 0; j < possibleEnemies.length; j++){
                if (points[i].x === possibleEnemies[j].position.x &&
                    points[i].y === possibleEnemies[j].position.y &&
                    !(possibleEnemies[j] as IHero).isDead &&
                    !this.rayTrace({x: sourceHero.position.x, y: sourceHero.position.y}, {x: points[i].x, y: points[i].y}, battle)
                ){
                    enemies.push(possibleEnemies[j].id);
                }
            }
        }
        return enemies;
    }

    useWeapon(battleId: string, targetId: string, weaponId: string): IBattle {
        const battle = this.getBattleById(battleId);
        const activeHero = this.getHeroById(battle.queue[0], battle);
        const target = this.getHeroById(targetId, battle);
        let weapon: IEquip;

        if (activeHero.primaryWeapon.id === weaponId) {
            weapon = activeHero.primaryWeapon;
        } else if (activeHero.secondaryWeapon.id === weaponId) {
            weapon = activeHero.secondaryWeapon;
        } else {
            return battle;
        }

        if (!this.canUseWeapon(activeHero, weapon)) {
            return battle;
        }

        let physDamage = weapon.physDamage + activeHero.strength - target.armor;
        if (physDamage < 0) {
            physDamage = 0;
        }
        let magicDamage = weapon.magicDamage + activeHero.intellect - target.will;
        if (magicDamage < 0) {
            magicDamage = 0;
        }

        const totalDamage = physDamage + magicDamage;

        this.heroTakesDamage(battle, activeHero, target, totalDamage);
        activeHero.energy -= weapon.energyCost;
        weapon.isUsed = true;

        battle.log.push({
            type: LogMessageType.WEAPON_DAMAGE,
            casterId: activeHero.id,
            targetId: target.id,
            value: totalDamage + '',
            id: weapon.id
        });

        const winner = battle.map.checkForWin(battle);
        if (winner) {
            this.battleEnd(battle, winner);
        }

        return battle;
    }
}
