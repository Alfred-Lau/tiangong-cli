"use strict";

module.exports = cli;

const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const exists = require("path-exists").sync;
const commander = require("commander");
const log = require("@lerna-usage/log");
const { getLatestVersion } = require("@lerna-usage/get-npm-info");

const pkg = require("../package.json");

// 第一种用法
const program = new commander.Command();

// 版本号检查功能
function checkPkgVersion() {
  log.info("当前软件版本", pkg.version);
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
    log.info("检查当前 Node 版本", colors.green(`${currentNodeVersion}`));
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
    log.info("检查用户主目录", ` ${userHome}`);
  }
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

/**
 *检查最新版本
 *
 */
async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  // const name = pkg.name;
  const name = "colors";

  const latestVersion = await getLatestVersion(name, currentVersion);
  if (semver.gt(latestVersion, currentVersion)) {
    log.info(
      "检查最新版本",
      `当前版本 ${currentVersion} 不是最新版本，请运行 ${colors.yellow(
        `npm i -g ${name} `
      )} 进行安装`
    );
  }
}

function registryCommand() {
  // first
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [option]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "设置目标调试路径", "");

  // third 正式开始注册事件
  program
    .command("init [name]")
    .option("-f, --force", "是否强制初始化项目")
    .action(require("@lerna-usage/exec"));

  // second 设置事件监听
  program.on("option:debug", function () {
    // 重点：发现和书上不太一样的时候，要寻根溯源到文档，更新的用法
    if (this.opts().debug) {
      process.env.LOG_LEVEL = "verbose";
    } else {
      process.env.LOG_LEVEL = "info";
    }

    log.level = process.env.LOG_LEVEL;
    log.verbose("我是在进行 debug");
  });

  program.on("option:targetPath", function () {
    const target_path = this.opts().targetPath;
    if (target_path) {
      process.env.CLI_TARGET_PATH = target_path;
    }
  });

  // 未知命令的处理逻辑
  program.on("command:*", function (unkonwnCommand) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.warn(colors.red(`${unkonwnCommand} 命令不存在`));
    program.outputHelp();
    if (availableCommands.length) {
      console.log(
        colors.yellow(`可用的命令有: ${availableCommands.join(",")}`)
      );
    }
  });

  // node exe.js xxx
  if (process.argv.length < 3) {
    program.outputHelp();
    console.log();
  }

  // last
  program.parse(process.argv);
}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkDefaultEnv();
  await checkGlobalUpdate();
}

async function cli(argv) {
  try {
    //  完成命令注册
    registryCommand();
  } catch (error) {
    // 隐藏堆栈信息，自定义
    log.error(error.message);
  }
}
