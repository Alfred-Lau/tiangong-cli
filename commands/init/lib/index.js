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

function init(projectName, cmdObj) {
  console.log(
    "init start working",
    projectName,
    cmdObj,
    process.env.CLI_TARGET_PATH
  );

  return new InitCommand();
}

module.exports = init;
