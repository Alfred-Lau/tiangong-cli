"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");

class PublishCommand extends Command {
  async prepare() {
    // 发布之前进行检查
  }
  init() {}
  exec() {}
}

function publish(args) {
  return new PublishCommand(args);
}

module.exports = publish;
