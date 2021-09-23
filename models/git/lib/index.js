"use strict";

const simpleGit = require("simple-git");
const path = require("path");
const userHome = require("user-home");
const fse = require("fs-extra");
const log = require("@tiangongkit/log");

const DEFAULT_CLI_HOME = ".tg_cli";
class Git {
  constructor({ name, version, dir }) {
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.git = simpleGit(dir);
    this.gitServer = null;
  }
  prepare() {
    //  1. 检查缓存主目录
    this.checkHomePath();
  }

  checkHomePath() {
    if (!this.homePath) {
      if (process.env.CLI_HOME_PATH) {
        this.homePath = process.env.CLI_HOME_PATH;
      } else {
        this.homePath = path.resolve(userHome, DEFAULT_CLI_HOME);
      }
    }
    fse.ensureDirSync(this.homePath);
    if (!fse.existsSync(this.homePath)) {
      throw new Error("用户主目录获取失败");
    }
  }
  init(options) {
    log.info("git init", options);
    this.prepare();
  }
}
module.exports = Git;
