'use strict';

module.exports = core;

const log = require('@lerna-usage/log');
const pkg = require('../package.json');

function core(argv) {
  checkPkgVersion();
}

function checkPkgVersion() {
  log(pkg.version);
}
