export interface IDepGraph {
  dependencies: {
    name: string;
    version: string;
  }[];
  name: string;
}

export interface IAnalysisParams {
  lockPath: string;
  depth: number;
  json: string;
}
