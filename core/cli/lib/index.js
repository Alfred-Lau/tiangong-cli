"use strict";

module.exports = core;

const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const exists = require("path-exists");
const log = require("@lerna-usage/log");
const pkg = require("../package.json");

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

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

/**
 *接茬用户主目录是否存在
 *
 */
function checkUserHome() {
  if (!userHome || !exists(userHome)) {
    throw new Error(colors.red("当前用户的主目录不存在"));
  } else {
    log.info(`当前用户主目录为 ${userHome}`);
  }
}

function core(argv) {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
  } catch (error) {
    // 隐藏堆栈信息，自定义
    log.error(error.message);
  }
}
