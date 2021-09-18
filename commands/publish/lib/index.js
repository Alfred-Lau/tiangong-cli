"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");
const pkgDir = require("pkg-dir").sync;
const path = require("path");
const fs = require("fs");

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

    log.info("", this.projectInfo);
  }
  init() {}
  async exec() {
    try {
      const startTime = new Date().getTime();
      // 1. 执行预检查
      this.prepare();
      const endTime = new Date().getTime();
      log.info("", `本次发布耗时：${(endTime - startTime) / 1000} s`);
    } catch (e) {}
  }
}

function publish(args) {
  return new PublishCommand(args);
}

module.exports = publish;
