import { existsNonEmptyWantedLockfile, readWantedLockfile, type Lockfile } from "@pnpm/lockfile-file";
import { ProjectId, DepPath } from "@pnpm/types";
import path from "path";
import { IDepGraph, IGraphInitOptions } from "../types";
import { parseImporters, parsePackages } from "../utils";
import { BaseDepGraph } from "./base";

export class PnpmLockGraph extends BaseDepGraph {
  private lockPath: string; // lock文件路径 ../test/pnpm-lock.yaml
  private pnpmLock: Lockfile | null = null; // lock文件内容

  constructor(options: IGraphInitOptions) {
    super();
    const { lockPath } = options;
    this.lockPath = lockPath;
  }

  private async load() {
    if (!!this.pnpmLock) return;
    const lockDirPath = path.dirname(this.lockPath); // lock文件父目录 ../test
    const resolvedLockFilePath = path.resolve(__dirname, lockDirPath); // 绝对路径 /Users/edy/devil/projects-sivan/packages/dep-ana-cli/src/test
    // 判断lock文件是否存在
    const exist = await existsNonEmptyWantedLockfile(resolvedLockFilePath);
    if (!exist) {
      throw new Error("Lock file does not exist or is empty!");
    }
    try {
      const pnpmLock = await readWantedLockfile(resolvedLockFilePath, {
        ignoreIncompatible: false, // 忽略不兼容
      });
      this.pnpmLock = pnpmLock;
    } catch (error) {
      throw new Error("Can't parse lock file!");
    }
  }

  async parse(): Promise<IDepGraph[]> {
    await this.load();
    const { importers, packages } = this.pnpmLock!;
    const graph: IDepGraph[] = [];
    // monorepo内部依赖
    if (importers) {
      const keys = Object.keys(importers);
      const temp = keys.map((key, i) => {
        if (i === 3) {
          const { dependencies, devDependencies } = importers[key as ProjectId];
          console.log(dependencies, devDependencies);
        }
      });
      // parseImporters(importers[keys[1] as ProjectId]);
      /* const modules = keys.map((key) => {
        return {
          name: key,
          dependencies: parseImporters(importers[key as ProjectId]),
        };
      });
      graph.push(...modules); */
    }
    // 第三方依赖
    if (packages) {
      const keys = Object.keys(packages);
      // if (key === "vite@5.3.4(@types/node@20.14.11)(sass@1.77.8)") console.log(i); 857
      parsePackages(packages[keys[857] as DepPath]);

      /* const modules = keys.map((key, i) => {
        // 处理特殊的包名
        // antd@5.19.2(react-dom@18.3.1(react@18.3.1))(react@18.3.1)
        // @rc-component/mutate-observer@1.1.0(react-dom@18.3.1(react@18.3.1))(react@18.3.1)
        // 解析结果
        // ['antd@5.19.2','antd','5.19.2']
        // ['@rc-component/mutate-observer@1.1.0','@rc-component/mutate-observer','1.1.0']
        // TODO 这里应该不需要对包名进行特殊处理
        // const REGEXP = /^([\w\@\/\-\d\.]+)@([\d\w\.\-]+)/;
        // const match = key.match(REGEXP) || [];
        return {
          name: key,
          dependencies: parsePackages(packages[key as DepPath]),
        };
      });
      graph.push(...modules); */
    }
    return graph;
  }
}
