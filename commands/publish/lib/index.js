"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");

class PublishCommand extends Command {
  prepare() {
    // 发布之前进行检查
    log.verbose("", "我要开始检查参数和build脚本是否存在了");
    //  1. 检查是否是一个合格的npm 包
  }
  init() {
    this.prepare();
  }
  async exec() {}
}

function publish(args) {
  return new PublishCommand(args);
}

module.exports = publish;
