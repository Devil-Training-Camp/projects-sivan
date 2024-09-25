export interface IAnalysisParams {
  lockPath: string; // lock文件路径
  depth: number; // 递归深度
  json: string; // 生成的json文件路径
}

export interface IDepGraph {
  name: string; // 包名
  dependencies: { name: string; version: string }[]; // 包依赖列表
}

export interface IGraphInitOptions {
  lockPath: string; // lock文件路径
}
