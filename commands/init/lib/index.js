"use strict";

module.exports = init;

const log = require("@lerna-usage/log");

function init(projectName, cmdObj) {
  log.info("init", projectName, cmdObj);
}
