import { type ProjectSnapshot, type PackageSnapshot } from "@pnpm/lockfile-file";

/**
dependencies 开发依赖
{
  '@pnpm/lockfile-file': '9.1.3(@pnpm/logger@5.2.0)',
  chalk: '4.1.2',
  commander: '12.1.0',
  inquirer: '8.2.6',
  koa: '2.15.3',
  'koa-body': '6.0.1',
  'koa-json': '2.0.2',
  'koa-logger': '3.2.1',
  'koa-router': '12.0.1',
  'koa2-cors': '2.0.6',
  open: '8.4.2',
  ora: '5.4.1'
}
devDependencies 生产依赖
{
  '@commitlint/cli': '19.3.0(@types/node@20.14.11)(typescript@5.5.3)',
  '@commitlint/config-conventional': '19.2.2',
  '@trivago/prettier-plugin-sort-imports': '4.3.0(prettier@3.2.5)',
  'eslint-config-prettier': '9.1.0(eslint@8.57.0)',
  husky: '9.1.1',
  'lint-staged': '15.2.7',
  prettier: '3.2.5'
}
 */
export const parseImporters = (ps: ProjectSnapshot) => {
  const { dependencies, devDependencies } = ps;
  return [dependencies, devDependencies]
    .map((dep) => {
      if (dep) {
        const keys = Object.keys(dep);
        return keys.map((key) => {
          const version = dep[key];
          return {
            name: key,
            version,
          };
        });
      }
      return [];
    })
    .flat();
};

export const parsePackages = (ps: PackageSnapshot) => {
  const { dependencies, peerDependencies } = ps;
  return [dependencies, peerDependencies]
    .map((dep) => {
      if (dep) {
        const keys = Object.keys(dep);
        return keys.map((key) => {
          const version = dep[key];
          return {
            name: key,
            version,
          };
        });
      }
      return [];
    })
    .flat();
};
