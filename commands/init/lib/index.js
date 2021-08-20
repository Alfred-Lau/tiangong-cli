"use strict";
const log = require("@tiangongkit/log");
const Command = require("@tiangongkit/command");

class InitCommand extends Command {
  init() {
    super.init();
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
