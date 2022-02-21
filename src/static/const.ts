import { ArchaeanTemple } from 'src/models/scenarios/archaean-temple';
import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';

export class Const {
  public static startCrystals = 0;
  public static moveEnergyCost = 3;
  public static scenarios = [ChthonRuins, ArchaeanTemple];
  public static moveOrder = ['avenger', 'shadow', 'avatar', 'oracle', 'paragon', 'druid', 'highlander', 'lightbringer'];
  public static maxPrimaryAttributes = 10;
  public static maxSecondaryAttributes = 4;
  public static rayTracePrecision = 8;
  public static reportsPath = './reports';
  public static statisticsFilePath = './reports/statistics';
  public static mctsTreeReportPath = './tree-observer/mcts-trees';
  public static explorationParameter = 2;
  public static botThinkTime = 300000;
  public static maxChainLength = 500;

  // Logs
  public static treeBuild = false;
  public static simulationInfo = false;
  public static memoryInfo = false;
  public static maxChainInfo = false;
  public static bestNodesInfo = false;
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
}
