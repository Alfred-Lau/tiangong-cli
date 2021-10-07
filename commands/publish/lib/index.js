"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");
const pkgDir = require("pkg-dir").sync;
const path = require("path");
const fs = require("fs");
const Git = require("@tiangongkit/git");

class PublishCommand extends Command {
  prepare() {
    // 发布之前进行检查

    // 1.确认项目是否为npm项目
    const projectPath = process.cwd();
    const pkgPath = path.resolve(projectPath, "package.json");
    if (!fs.existsSync(pkgPath)) {
      throw new Error("package.json不存在！");
    }
    const { name, version, scripts } = require(pkgPath);
    if (!name || !version || !scripts.build) {
      log.error(
        "",
        "package.json信息不全，请检查是否存在name、version和scripts（需提供build命令）！"
      );
      throw new Error(
        "package.json信息不全，请检查是否存在name、version和scripts（需提供build命令）！"
      );
    }

    this.projectInfo = {
      name,
      version,
      dir: projectPath,
    };
  }

  init() {
    // 1. 初始化处理参数
    // 是否强制刷新服务器文件
    this.options = {
      refreshServer: this._options.refreshServer || false,
      refreshToken: this._options.refreshToken || false,
      refreshOwner: this._options.refreshOwner || false,
    };
    // this.publishOpts = this._options;
  }
  async exec() {
    try {
      const startTime = new Date().getTime();
      // 1. 执行预检查
      this.prepare();
      // 2. gitflow 预检查
      const git = new Git(this.projectInfo, this.options);
      await git.init({ rewrite: this.refreshServer });
      // 3. 云构建
      const endTime = new Date().getTime();
      log.info("", `本次发布耗时：${(endTime - startTime) / 1000} s`);
    } catch (e) {
      log.error(e.message);
    }
  }
}

function publish(args) {
  return new PublishCommand(args);
}

module.exports = publish;
