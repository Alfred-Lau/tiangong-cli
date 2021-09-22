"use strict";

const simpleGit = require("simple-git");
const log = require("@tiangongkit/log");

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
    log.info("", "开始检查用户目录是否存在");
  }
  init(options) {
    log.info("git init", options);
  }
}
module.exports = Git;
