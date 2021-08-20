"use strict";

const log = require("@tiangongkit/log");

class Command {
    constructor(options = {}) {
        console.log("", JSON.stringify(options));
    }

    init() {}
    exec() {}
}

module.exports = Command;
