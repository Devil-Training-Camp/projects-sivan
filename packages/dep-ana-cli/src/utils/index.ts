import { type ProjectSnapshot, type PackageSnapshot } from "@pnpm/lockfile-file";

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
