'use strict';

module.exports = core;

const semver = require('semver');
const colors = require('colors/safe');
const log = require('@lerna-usage/log');
const pkg = require('../package.json');

function core(argv) {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (error) {
    // 隐藏堆栈信息，自定义
    log.error(error.message);
  }
}
// 版本号检查功能
function checkPkgVersion() {
  log.info(pkg.version);
}

// 最低 node 版本兼容性检查
function checkNodeVersion() {
  // 获取 当前版本
  const currentNodeVersion = process.version;
  // 获取 最低版本
  const lastNodeVersion = pkg.engines.node;

  if (semver.lt(currentNodeVersion, lastNodeVersion)) {
    throw new Error(colors.red(`node 版本必须高于 ${lastNodeVersion}`));
  } else {
    log.success(colors.green(`当前 Node 版本: ${currentNodeVersion}`));
  }
}
