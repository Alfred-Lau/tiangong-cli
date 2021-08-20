"use strict";

const log = require("@tiangongkit/log");

class Command {
  constructor(options = {}) {
    log.info("我是基类，我开始输出了", options);
  }

  init() {}
  exec() {}
}

module.exports = Command;
