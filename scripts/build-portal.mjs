import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
// Keep Webpack available for local Windows validation only. Pages releases
// use Turbopack consistently so clients don't mix incompatible RSC payloads.
if (!args.length) args.push(process.platform === 'win32' && !process.env.CI ? '--webpack' : '--turbopack');
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build', ...args], {
  stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
