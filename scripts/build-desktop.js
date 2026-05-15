#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const WEB_BUILD = path.join(ROOT, 'packages/008/web-build');
const APP_DIR = path.join(ROOT, 'packages/008desktop/app');
const APP_STATIC = path.join(APP_DIR, 'static');
const NESTED_STATIC_PARENT = path.join(APP_STATIC, 'js');
const NESTED_STATIC = path.join(NESTED_STATIC_PARENT, 'static');

function run(cmd, args, env = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...env },
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dst) {
  fs.cpSync(src, dst, { recursive: true });
}

run('yarn', ['lerna', 'run', 'build-web'], { IS_ELECTRON: 'yes' });

if (!fs.existsSync(WEB_BUILD)) {
  console.error(
    `Expected web build output at ${WEB_BUILD} but it does not exist.`
  );
  process.exit(1);
}

rmrf(APP_DIR);
fs.renameSync(WEB_BUILD, APP_DIR);

if (fs.existsSync(APP_STATIC)) {
  // Replicate the legacy two-step copy: clone static/ to a sibling temp dir,
  // then move it under static/js/static. Going via a sibling avoids cpSync
  // recursing into its own destination.
  const tempStatic = path.join(APP_DIR, 'static2');
  rmrf(tempStatic);
  copyDir(APP_STATIC, tempStatic);
  fs.mkdirSync(NESTED_STATIC_PARENT, { recursive: true });
  rmrf(NESTED_STATIC);
  fs.renameSync(tempStatic, NESTED_STATIC);
}

run('yarn', ['lerna', 'run', 'build', '--scope', '008desktop']);
