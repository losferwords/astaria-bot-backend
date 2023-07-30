import { ArchaeanTemple } from 'src/models/scenarios/archaean-temple';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';
import { ArenaOfAcheos1x1 } from 'src/models/scenarios/arena-of-acheos-1x1';
import { ArenaOfAcheos1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1';
import { ArenaOfAcheos1x1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1x1';
import { ArenaOfAcheos2x2 } from 'src/models/scenarios/arena-of-acheos-2x2';

export class Const {
  static startCrystals = 0;
  static maxCrystalsBeforeOverload = 2;
  static moveEnergyCost = 3;
  static scenarios = [
    ChthonRuins,
    ArchaeanTemple,
    ArenaOfAcheos1x1,
    ArenaOfAcheos1x1x1,
    ArenaOfAcheos1x1x1x1,
    ArenaOfAcheos2x2
  ];
  static moveOrder = [
    'avenger',
    'oracle',
    'navarch',
    'shadow',
    'avatar',
    'paragon',
    'druid',
    'highlander',
    'lightbringer'
  ];
  static maxPrimaryAttributes = 10;
  static maxSecondaryAttributes = 4;
  static rayTracePrecision = 8;
  static reportsPath = './reports';
  static statisticsFilePath = './reports/statistics';
  static mctsTreeReportPath = './tree-observer/mcts-trees';
  static explorationParameter = 2;
  static botThinkTime = 120000;
  static maxChainLength = 500;
  static obviousMoveMinSims = 10000;
  static obviousMoveRatio = 0.95;
  static numberOfServers = 1;
  static maxNumberOfNodesForInternalServer = 200000;
  static maxNumberOfNodesForExternalServer = 100000;
  static reportSortingArray = [
    'paragon',
    'highlander',
    'druid',
    'oracle',
    'avatar',
    'shadow',
    'lightbringer',
    'avenger',
    'navarch'
  ];

  // Logs
  static treeBuild = false;
  static simulationInfo = true;
  static simulationTimeInfo = false;
  static memoryInfo = false;
  static maxChainInfo = false;
  static bestNodesInfo = false;
  static obviousMoveInfo = false;
}
