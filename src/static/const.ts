import { ArchaeanTemple } from 'src/models/scenarios/archaean-temple';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';
import { ArenaOfAcheos1x1 } from 'src/models/scenarios/arena-of-acheos-1x1';
import { ArenaOfAcheos1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1';
import { ArenaOfAcheos1x1x1x1 } from 'src/models/scenarios/arena-of-acheos-1x1x1x1';
import { ArenaOfAcheos2x2 } from 'src/models/scenarios/arena-of-acheos-2x2';

export class Const {
  public static startCrystals = 0;
  public static moveEnergyCost = 3;
  public static scenarios = [
    ChthonRuins,
    ArchaeanTemple,
    ArenaOfAcheos1x1,
    ArenaOfAcheos1x1x1,
    ArenaOfAcheos1x1x1x1,
    ArenaOfAcheos2x2
  ];
  public static moveOrder = ['avenger', 'oracle', 'shadow', 'avatar', 'paragon', 'druid', 'highlander', 'lightbringer'];
  public static maxPrimaryAttributes = 10;
  public static maxSecondaryAttributes = 4;
  public static rayTracePrecision = 8;
  public static reportsPath = './reports';
  public static statisticsFilePath = './reports/statistics';
  public static mctsTreeReportPath = './tree-observer/mcts-trees';
  public static explorationParameter = 2;
  public static botThinkTime = 120000;
  public static maxChainLength = 500;
  public static obviousMoveMinSims = 10000;
  public static obviousMoveRatio = 0.95;
  public static numberOfServers = 2;
  public static maxNumberOfNodesForInternalServer = 200000;
  public static maxNumberOfNodesForExternalServer = 100000;
  public static reportSortingArray = [
    'paragon',
    'highlander',
    'druid',
    'oracle',
    'avatar',
    'shadow',
    'lightbringer',
    'avenger'
  ];

  // Logs
  public static treeBuild = false;
  public static simulationInfo = true;
  public static simulationTimeInfo = false;
  public static memoryInfo = false;
  public static maxChainInfo = false;
  public static bestNodesInfo = false;
  public static obviousMoveInfo = false;
}
