"use strict";

const log = require("@tiangongkit/log");
const pkg = require("../package.json");
const semver = require("semver");
const colors = require("colors/safe");

class Command {
  constructor(argv) {
    // 1. 执行基类的初始化逻辑
    // 1.1 验证参数合法性
    if (!argv) {
      log.error("命令参数不能为空");
    }

    if (!Array.isArray(argv)) {
      log.error("命令参数必须为数组");
    }

    this._argv = argv;

    //  1.2 启动初始执行逻辑

    let runner = new Promise(() => {
      let chain = Promise.resolve();
      chain.then(() => {
        this.checkNodeVersion();
      });
      chain.then(() => {
        this.initArgs();
      });
      chain.then(() => {
        this.init();
      });
      chain.then(() => {
        this.exec();
      });

      chain.catch((err) => log.error("", err.message));
    });
  }

  init() {
    throw new Error("init 方法必须实现");
  }
  exec() {
    throw new Error("exec 方法必须实现");
  }
  // 最低 node 版本兼容性检查

  checkNodeVersion() {
    // 获取 当前版本
    const currentNodeVersion = process.version;
    // 获取 最低版本
    const lastNodeVersion = pkg.engines.node;

    if (semver.lt(currentNodeVersion, lastNodeVersion)) {
      throw new Error(colors.red(`node 版本必须高于 ${lastNodeVersion}`));
    } else {
      log.verbose("检查当前 Node 版本", colors.green(`${currentNodeVersion}`));
    }
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }
}

module.exports = Command;
