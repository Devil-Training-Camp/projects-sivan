import { existsNonEmptyWantedLockfile, readWantedLockfile, type Lockfile } from "@pnpm/lockfile-file";
import { type ProjectId, type DepPath } from "@pnpm/types";
import path from "path";
import { IDepGraph } from "../types";
import { parseImporters, parsePackages } from "../utils";
import { BaseDepGraph } from "./base";

export class PnpmLockGraph extends BaseDepGraph {
  private lockPath: string;
  private pnpmLock: Lockfile | null = null;

  constructor(options: any) {
    super();
    const { lockPath } = options;
    this.lockPath = lockPath;
  }

  private async load() {
    if (!!this.pnpmLock) return;
    const dirname = path.dirname(this.lockPath);
    const pkgPath = path.resolve(__dirname, dirname); // /Users/edy/devil/projects-sivan/packages/dep-ana-cli/src/test
    const exist = await existsNonEmptyWantedLockfile(pkgPath);
    if (!exist) {
      throw new Error("Lock file does not exist or is empty!");
    }
    const pnpmLock = await readWantedLockfile(pkgPath, {
      ignoreIncompatible: false, // 忽略不兼容
    });
    if (!pnpmLock) {
      throw new Error("Can't parse lock file!");
    }
    this.pnpmLock = pnpmLock;
  }

  async parse(): Promise<IDepGraph[]> {
    await this.load();
    const { importers, packages } = this.pnpmLock!;
    const graph: IDepGraph[] = [];
    // monorepo内部依赖
    if (importers) {
      const keys = Object.keys(importers);
      const modules = keys.map((key) => {
        return {
          dependencies: parseImporters(importers[key as ProjectId]),
          name: key,
        };
      });
      graph.push(...modules);
    }
    // 第三方依赖
    if (packages) {
      const keys = Object.keys(packages);
      const modules = keys.map((key) => {
        const REGEXP = /^([\w\@\/\-\d\.]+)@([\d\w\.\-]+)/;
        const match = key.match(REGEXP) || [];
        return {
          dependencies: parsePackages(packages[key as DepPath]),
          name: match[1],
        };
      });
      graph.push(...modules);
    }
    return graph;
  }
}
