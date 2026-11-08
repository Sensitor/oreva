/// <reference types="node" />
import { describe, expect, it } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import packageJson from '../../package.json';

/**
 * Babel (babel-preset-expo) rewrites every app file to require
 * `@babel/runtime/helpers/*`, so the app itself must declare `@babel/runtime`.
 *
 * pnpm's `jest` launcher on Linux and macOS sets NODE_PATH to pnpm's internal
 * store, which hid a missing declaration; on Windows the tests failed. Jest
 * also replaces `require.resolve` and `createRequire`. So this test asks a
 * separate Node process, with NODE_PATH cleared, to resolve the helpers from
 * the app folder: the same result on every operating system.
 */
describe('toolchain dependencies', () => {
  const appRoot = path.resolve(__dirname, '../..');

  function resolveWithNode(request: string): string {
    return execFileSync(
      process.execPath,
      ['-e', `process.stdout.write(require.resolve(${JSON.stringify(request)}))`],
      {
        cwd: appRoot,
        env: { ...process.env, NODE_PATH: '' },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  }

  it('declares @babel/runtime as an app dependency', () => {
    expect(packageJson.dependencies).toHaveProperty('@babel/runtime');
  });

  it.each(['interopRequireDefault', 'interopRequireWildcard', 'asyncToGenerator'])(
    'resolves @babel/runtime/helpers/%s from the app folder with Node resolution',
    (helper) => {
      expect(resolveWithNode(`@babel/runtime/helpers/${helper}`)).toContain(
        path.join('@babel', 'runtime'),
      );
    },
  );
});
