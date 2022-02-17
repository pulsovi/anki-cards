import readPkgUp from 'read-pkg-up';

let packageName: string | null = null;
export function getPackageName (): string {
  if (!packageName) {
    const pkg = readPkgUp.sync({ cwd: __dirname });
    if (typeof pkg?.packageJson.name === 'string') packageName = pkg.packageJson.name;
    else packageName = __dirname;
  }
  return packageName;
}
