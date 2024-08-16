import { PnpmLockGraph } from "../managers/pnpm";
import { IAnalysisParams } from "../types";

export const analysis = async (params: IAnalysisParams) => {
  const { lockPath, depth, json } = params;
  // 判断使用哪个文件的解析方式
  const graph = new PnpmLockGraph({ lockPath });
  const deps = await graph.parse();
};
