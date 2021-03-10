"use strict";

module.exports = cli;

const path = require("path");
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
 *检查输入参数, 添加debug 模式
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

function checkDefaultEnv() {
  const DefaultEnvConfigPath = path.resolve(userHome, ".env");
  let env;

  if (exists(DefaultEnvConfigPath)) {
    // 完成 env 数据的加载
    env = require("dotenv").config({
      path: DefaultEnvConfigPath,
    });
  }
  creatDefaultEnvConfig();
  // 后面直接使用这个就可以
  log.verbose("当前环境变量配置: ", process.env.CLI_HOME_PATH);
}

function creatDefaultEnvConfig() {
  const cliConfig = {
    userHome,
  };

  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, ".tg_cli");
  }

  // 最终完成重新赋值
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function cli(argv) {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkUserInputArgs();
    checkDefaultEnv();
    // tg-cli --debug 生效
  } catch (error) {
    // 隐藏堆栈信息，自定义
    log.error(error.message);
  }
}
