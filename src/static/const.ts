import { ChthonRuins } from 'src/models/scenarios/chthon-ruins';

export class Const {
  public static moveEnergyCost = 3;
  public static scenarios = [ChthonRuins];
  public static moveOrder = ['oracle', 'paragon', 'druid', 'highlander'];
  public static maxPrimaryAttributes = 10;
  public static maxSecondaryAttributes = 4;
  public static rayTracePrecision = 8;
  public static reportsPath = './reports';
  public static statisticsFilePath = './reports/statistics';
  public static mctsTreeReportPath = './tree-observer/mcts-trees';
  public static explorationParameter = 2;
  public static botThinkTime = 120000;
  public static treeBuild = false;
}
