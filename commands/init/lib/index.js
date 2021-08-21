"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");

class InitCommand extends Command {
  init() {
    // 开始初始化
    console.log("", this._cmd, this._argv);
  }

  exec() {
    super.exec();
  }
}

function init(args) {
  console.log("init start working");

  return new InitCommand(args);
}

module.exports = init;
