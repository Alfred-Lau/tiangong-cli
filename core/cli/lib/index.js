"use strict";

module.exports = core;

const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const exists = require("path-exists");
const log = require("@lerna-usage/log");
const minimist = require("minimist");
const pkg = require("../package.json");

let args = process.argv.slice(2);

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
 *检查用户主目录是否存在
 *
 */
function checkUserHome() {
  if (!userHome || !exists(userHome)) {
    throw new Error(colors.red("当前用户的主目录不存在"));
  } else {
    log.info(`当前用户主目录为 ${userHome}`);
  }
}

/**
 *检查输入参数
 *
 */
function checkUserInputArgs() {
  args = minimist(args);
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose";
  } else {
    process.env.LOG_LEVEL = "info";
  }

  log.level = process.env.LOG_LEVEL;
}

function core(argv) {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkUserInputArgs();
    // tg-cli --debug 生效
    log.verbose("debug", "test debug log");
  } catch (error) {
    // 隐藏堆栈信息，自定义
    log.error(error.message);
  }
}
