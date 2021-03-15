"use strict";

module.exports = init;

const log = require("@tiangongkit/log");

function init(projectName, cmdObj) {
  log.info("init", projectName, cmdObj, process.env.CLI_TARGET_PATH);
}
