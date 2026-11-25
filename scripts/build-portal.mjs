import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// The Windows CSS worker fails under Turbopack in the desktop runtime.
const args = process.argv.slice(2);
if (process.platform === 'win32' && !args.length) args.push('--webpack');
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build', ...args], {
  stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
