import { existsNonEmptyWantedLockfile, readWantedLockfile, type Lockfile } from "@pnpm/lockfile-file";
import path from "path";
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

  async parse(): Promise<any> {
    await this.load();
    const { importers, packages } = this.pnpmLock!;
    const graph: any[] = [];
    // monorepo内部依赖
    if (importers) {
      /* const [
        importerName,
        { dependencies = {}, devDependencies = {} }
      ] of Object.entries(importers) */
      // console.log(importers);
      // console.log(Object.keys(importers));
      // const {importerName,{dependencies={},devDependencies={}}} = Object.entries(importers)[1][1]
      // console.log(Object.entries(importers)[1]);
      const [importerName, { dependencies = {}, devDependencies = {} }] = Object.entries(importers)[2];
      for (const [depName] of Object.entries({
        ...dependencies,
        ...devDependencies,
      })) {
        graph.push({
          source: importerName, // 依赖源
          target: depName, // 依赖目标
        });
        console.log("importerName", importerName);
        console.log("depName", depName);
        // nodeSet.add(depName) // 添加依赖节点
      }
    }
    // 第三方依赖
    if (packages) {
    }
  }
}
